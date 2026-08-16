# Furr: Firebase Setup Guide

Follow these steps exactly to set up the Firebase project for Furr. This will give you the configuration keys needed to connect the Owner App, Vet Portal, and Admin Portal to a real backend.

## Step 1: Create the Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or Add project).
3. Enter the project name: `Furr` (or `Furr-Dev` for development).
4. Check the box to accept the Firebase terms.
5. Click **Continue**.
6. Turn **Off** Google Analytics for now (you can enable it later).
7. Click **Create project** and wait for it to finish. Click **Continue**.

## Step 2: Register the Web App (To get API Keys)

Firebase requires you to register an "app" to generate the connection keys. We will create a single Web App config that all three Furr applications will share.

1. On the Firebase Project Overview page, click the **Web icon (`</>`)** in the center of the screen.
2. Enter an app nickname: `Furr Web Services`.
3. Leave "Also set up Firebase Hosting" unchecked for now.
4. Click **Register app**.
5. You will see a block of code containing `firebaseConfig`. **Copy the contents of this block.** It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "furr-xyz.firebaseapp.com",
  projectId: "furr-xyz",
  storageBucket: "furr-xyz.firebasestorage.app",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

6. Click **Continue to console**.
7. **Paste that config to me in the chat** so I can wire up the `.env` files.

## Step 3: Enable Authentication

We need to enable Phone Auth (for owners) and Email/Password (for Vets/Admins).

1. In the left sidebar, expand **Build** and click **Authentication**.
2. Click **Get started**.
3. Click on the **Sign-in method** tab.
4. Under "Native providers", click **Phone**.
   - Toggle **Enable** to on.
   - Expand the **Phone numbers for testing** section.
   - Add a test number (e.g., `+94770000000`) and a verification code (e.g., `123456`). **This is crucial for testing without spending SMS quota.**
   - Click **Save**.
5. Click **Add new provider**.
6. Click **Email/Password**.
   - Toggle **Enable** to on (leave "Email link" off).
   - Click **Save**.

## Step 4: Enable Firestore Database

This is where all user profiles, pets, and health records will be stored.

1. In the left sidebar, under **Build**, click **Firestore Database**.
2. Click **Create database**.
3. Location: Choose the region closest to Sri Lanka (e.g., `asia-south1` Mumbai or `asia-southeast1` Singapore). **Note: You cannot change this later.**
4. Click **Next**.
5. Choose **Start in test mode** (I will write the secure rules for you later).
6. Click **Create**.

## Step 5: Enable Cloud Storage (DEFERRED — Requires Blaze Plan)

> **Note:** Cloud Storage now requires the Blaze (Pay-as-you-go) plan. This has been deferred.
> Document/photo uploads will continue using the dev-bypass mock until the plan is upgraded.
> When ready, upgrade to Blaze (still has a generous free tier), then:

1. In the left sidebar, under **Build**, click **Storage**.
2. Click **Get started**.
3. Choose **Start in test mode**.
4. Click **Next**.
5. The location will default to the one you chose for Firestore. Click **Done**.

## Current Status (11 Aug 2026)

- ✅ Firebase project `furr-dev` created
- ✅ Phone Authentication enabled (with test number)
- ✅ Email/Password Authentication enabled
- ✅ Firestore Database created
- ⏸️ Cloud Storage — deferred (Blaze plan required)
- ✅ `.env` files created for all 3 apps
- ✅ `firestore.rules` written at `firebase/firestore.rules`
- ✅ `IS_DEV_BYPASS` updated to detect real config
