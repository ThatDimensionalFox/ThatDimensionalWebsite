#!/usr/bin/env python3

import os
import sqlite3
import secrets
import base64
import hashlib
import json
from datetime import datetime
from urllib.parse import urlencode

import requests
from flask import (
    Flask, session, redirect, request, jsonify, g,
    render_template_string, url_for
)
from flask_session import Session
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Config
APP_SECRET = os.environ.get("FLASK_SECRET", secrets.token_hex(32))
DISCORD_CLIENT_ID = os.environ.get("DISCORD_CLIENT_ID", "")
DISCORD_CLIENT_SECRET = os.environ.get("DISCORD_CLIENT_SECRET", "")
DISCORD_REDIRECT_URI = os.environ.get("DISCORD_REDIRECT_URI", "https://discord.com/oauth2/authorize?client_id=1432866075078299648&response_type=code&redirect_uri=https%3A%2F%2Fthatdimensionalwebsite.com%2F&scope=identify+email+openid")

TWITTER_CLIENT_ID = os.environ.get("TWITTER_CLIENT_ID", "")
TWITTER_REDIRECT_URI = os.environ.get("TWITTER_REDIRECT_URI", "http://localhost:5000/auth/twitter/callback")

DATABASE = os.path.join(os.path.dirname(__file__), "data", "users.db")
os.makedirs(os.path.dirname(DATABASE), exist_ok=True)

app = Flask(__name__, static_folder=None)
app.secret_key = APP_SECRET
app.config["SESSION_TYPE"] = "filesystem"   # simple, server-side sessions
app.config["SESSION_PERMANENT"] = False
Session(app)

# -------------------------
# Database helpers
# -------------------------
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE, detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider TEXT NOT NULL,          -- 'discord' or 'twitter'
        provider_id TEXT NOT NULL,       -- provider's unique id for the user
        username TEXT,                   -- e.g. 'rem#1234' or twitter handle
        display_name TEXT,
        avatar_url TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(provider, provider_id)
    );
    """)
    db.commit()

# Initialize DB at startup
with app.app_context():
    init_db()

# -------------------------
# Utility helpers
# -------------------------
def make_state():
    return secrets.token_urlsafe(16)

def make_code_verifier():
    # high-entropy random string (43-128 chars). We'll produce 64 chars base64-url.
    return base64.urlsafe_b64encode(secrets.token_bytes(48)).rstrip(b"=").decode("ascii")

def code_challenge_from_verifier(verifier: str):
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")

def upsert_social_user(provider, provider_id, username=None, display_name=None, avatar_url=None):
    """
    Insert or update user record based on provider+provider_id.
    Returns local user row as dict.
    """
    db = get_db()
    # Try find
    row = db.execute(
        "SELECT * FROM users WHERE provider = ? AND provider_id = ?",
        (provider, provider_id)
    ).fetchone()
    if row:
        # Update fields if changed
        db.execute("""
            UPDATE users SET username = COALESCE(?, username),
                              display_name = COALESCE(?, display_name),
                              avatar_url = COALESCE(?, avatar_url)
            WHERE provider = ? AND provider_id = ?
        """, (username, display_name, avatar_url, provider, provider_id))
        db.commit()
        row = db.execute(
            "SELECT * FROM users WHERE provider = ? AND provider_id = ?",
            (provider, provider_id)
        ).fetchone()
    else:
        cur = db.execute("""
            INSERT INTO users (provider, provider_id, username, display_name, avatar_url)
            VALUES (?, ?, ?, ?, ?)
        """, (provider, provider_id, username, display_name, avatar_url))
        db.commit()
        row = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return dict(row)

# -------------------------
# Popup HTML helpers
# -------------------------
POPUP_SUCCESS = """<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Login success</title></head>
  <body>
    <script>
      const message = { type: 'oauth_success', provider: '{{provider}}' };
      try {
        // try to post to opener's origin (safer) if accessible
        try {
          const origin = window.opener && window.opener.location && window.opener.location.origin;
          if (origin) {
            window.opener.postMessage(message, origin);
          } else {
            window.opener.postMessage(message, '*');
          }
        } catch(e) {
          // cross-origin: fallback to wildcard
          window.opener.postMessage(message, '*');
        }
      } catch (e) {}
      // close window quickly
      setTimeout(() => window.close(), 400);
    </script>
    <p>Login successful. You can close this window.</p>
  </body>
</html>
"""

POPUP_ERROR = """<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Login error</title></head>
  <body>
    <script>
      const message = { type: 'oauth_error', provider: '{{provider}}', error: '{{error}}' };
      try {
        try {
          const origin = window.opener && window.opener.location && window.opener.location.origin;
          if (origin) {
            window.opener.postMessage(message, origin);
          } else {
            window.opener.postMessage(message, '*');
          }
        } catch(e) {
          window.opener.postMessage(message, '*');
        }
      } catch (e) {}
      setTimeout(() => window.close(), 1200);
    </script>
    <p>Login failed: {{error}}. This window will close automatically.</p>
  </body>
</html>
"""

def popup_success(provider):
    return render_template_string(POPUP_SUCCESS, provider=provider)

def popup_error(provider, error):
    # sanitize error for embedding
    err = str(error).replace("'", "").replace("\n", " ")
    return render_template_string(POPUP_ERROR, provider=provider, error=err)

# -------------------------
# API: whoami
# -------------------------
@app.route("/api/me")
def api_me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"user": None})
    db = get_db()
    row = db.execute("SELECT id, provider, provider_id, username, display_name, avatar_url, xp, level, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        session.pop("user_id", None)
        return jsonify({"user": None})
    return jsonify({"user": dict(row)})

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})

# -------------------------
# Discord OAuth routes
# -------------------------
@app.route("/auth/discord")
def auth_discord():
    # Create state and store in session
    state = make_state()
    session["oauth_state"] = state
    params = {
        "response_type": "code",
        "client_id": DISCORD_CLIENT_ID,
        "scope": "identify email",
        "redirect_uri": DISCORD_REDIRECT_URI,
        "state": state,
        "prompt": "consent"
    }
    auth_url = "https://discord.com/api/oauth2/authorize?" + urlencode(params)
    return redirect(auth_url)

@app.route("/auth/discord/callback")
def auth_discord_callback():
    error = request.args.get("error")
    if error:
        return popup_error("discord", error)

    code = request.args.get("code")
    state = request.args.get("state")
    if not code or not state or state != session.get("oauth_state"):
        return popup_error("discord", "invalid_state_or_code")

    # Exchange token
    token_url = "https://discord.com/api/oauth2/token"
    data = {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": DISCORD_REDIRECT_URI
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    try:
        resp = requests.post(token_url, data=data, headers=headers, timeout=10)
        resp.raise_for_status()
        tokens = resp.json()
        access_token = tokens.get("access_token")
        if not access_token:
            return popup_error("discord", "missing_access_token")
        # fetch user
        user_resp = requests.get("https://discord.com/api/users/@me", headers={"Authorization": f"Bearer {access_token}"}, timeout=10)
        user_resp.raise_for_status()
        u = user_resp.json()
        # Build user info
        discord_id = u.get("id")
        username = u.get("username")
        discriminator = u.get("discriminator")
        display_name = f"{username}#{discriminator}" if username and discriminator else username or ""
        avatar = u.get("avatar")
        avatar_url = ""
        if avatar:
            avatar_url = f"https://cdn.discordapp.com/avatars/{discord_id}/{avatar}.png"

        # Store or update local user
        local = upsert_social_user("discord", discord_id, username=display_name, display_name=display_name, avatar_url=avatar_url)
        session["user_id"] = local["id"]
        # success: let the popup postMessage and close
        return popup_success("discord")
    except requests.RequestException as e:
        app.logger.exception("Discord token/profile fetch error")
        return popup_error("discord", "token_or_profile_error")

# -------------------------
# Twitter OAuth2 (Authorization Code + PKCE)
# -------------------------
@app.route("/auth/twitter")
def auth_twitter():
    state = make_state()
    verifier = make_code_verifier()
    challenge = code_challenge_from_verifier(verifier)
    # store in session for callback
    session["oauth_state"] = state
    session["twitter_pkce_verifier"] = verifier

    # scopes: adjust as needed. 'offline.access' enables refresh token
    scope = "tweet.read users.read offline.access"
    params = {
        "response_type": "code",
        "client_id": TWITTER_CLIENT_ID,
        "redirect_uri": TWITTER_REDIRECT_URI,
        "scope": scope,
        "state": state,
        "code_challenge": challenge,
        "code_challenge_method": "S256"
    }
    auth_url = "https://twitter.com/i/oauth2/authorize?" + urlencode(params)
    return redirect(auth_url)

@app.route("/auth/twitter/callback")
def auth_twitter_callback():
    error = request.args.get("error")
    if error:
        return popup_error("twitter", error)

    code = request.args.get("code")
    state = request.args.get("state")
    if not code or not state or state != session.get("oauth_state"):
        return popup_error("twitter", "invalid_state_or_code")

    code_verifier = session.get("twitter_pkce_verifier")
    if not code_verifier:
        return popup_error("twitter", "missing_code_verifier")

    token_url = "https://api.twitter.com/2/oauth2/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": TWITTER_CLIENT_ID,
        "code": code,
        "redirect_uri": TWITTER_REDIRECT_URI,
        "code_verifier": code_verifier
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    try:
        resp = requests.post(token_url, data=data, headers=headers, timeout=10)
        resp.raise_for_status()
        token_json = resp.json()
        access_token = token_json.get("access_token")
        if not access_token:
            return popup_error("twitter", "no_access_token")
        # fetch user info
        # request profile image if available
        user_url = "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username"
        user_resp = requests.get(user_url, headers={"Authorization": f"Bearer {access_token}"}, timeout=10)
        user_resp.raise_for_status()
        uj = user_resp.json().get("data", {})
        twitter_id = uj.get("id")
        username = uj.get("username")
        display_name = uj.get("name") or username
        avatar_url = uj.get("profile_image_url") or ""
        if twitter_id is None:
            return popup_error("twitter", "no_user")
        local = upsert_social_user("twitter", twitter_id, username=username, display_name=display_name, avatar_url=avatar_url)
        session["user_id"] = local["id"]
        return popup_success("twitter")
    except requests.RequestException as e:
        app.logger.exception("Twitter token/profile error")
        return popup_error("twitter", "token_or_profile_error")

# -------------------------
# Root / quick health
# -------------------------
@app.route("/")
def index():
    return jsonify({"status": "ok", "message": "OAuth server running. Use /auth/discord or /auth/twitter"})

# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    # development only: enable debug if FLASK_ENV=development
    debug_flag = os.environ.get("FLASK_ENV", "").lower() == "development"
    app.run(host="0.0.0.0", port=5000, debug=debug_flag)
