# 🎰 Fair Gambling — Hard CTF Challenge

<p align="center">
  <img src="https://img.shields.io/badge/CTF-Web_Exploitation-8A2BE2?style=for-the-badge" alt="Web Exploitation"/>
  <img src="https://img.shields.io/badge/Difficulty-Hard-FF3333?style=for-the-badge" alt="Hard Difficulty"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/WebSockets-010101?style=for-the-badge" alt="WebSockets"/>
</p>

<h3 align="center">🎲 The House Claims It's Fair. Can You Prove Otherwise?</h3>

<p align="center">
  <b>One casino. One million dollars. One hidden flag.</b><br/>
  Your objective is to investigate the game's fairness mechanism, uncover its weakness, and capture the flag.
</p>

<p align="center">
  <a href="https://fair-gambling.onrender.com/">
    <img src="https://img.shields.io/badge/🚀_PLAY_THE_CHALLENGE-Launch_Game-00C853?style=for-the-badge" alt="Play Fair Gambling"/>
  </a>
</p>

---

## 🕹️ Challenge Overview

**Fair Gambling** is a hard-level Capture The Flag (CTF) challenge built around a casino-style slot machine and a supposedly provably-fair random number generation system.

Players start with a limited balance and must investigate how the game generates outcomes, manages cryptographic seeds, and processes spins.

Luck alone may not be enough. Understanding the implementation is the key to solving the challenge.

### 🎯 Your Mission

- 🎰 Explore the slot machine and understand its rules.
- 🔍 Investigate how spin outcomes are generated.
- 🔐 Examine the server-seed commitment and client-seed mechanism.
- 🧩 Identify a weakness in the fairness or game-state logic.
- 🏆 Reach the required balance and retrieve the hidden CTF flag.

**Can you beat the house without relying on luck?**

---

## 💰 Game Rules

| Parameter | Value |
|---|---|
| 💵 Starting Balance | $1,000 |
| 🎲 Cost per Spin | $25 |
| 🏆 Target Balance | $1,000,000 |
| 🔐 Fairness Mechanism | Server seed, client seed, nonce |
| 🏁 Objective | Retrieve the CTF flag |

The challenge requires players to examine the relationship between the game's cryptographic mechanism and its server-side state management.

---

## 🔬 Technical Highlights

### 🔐 Provably-Fair Randomness

The game uses cryptographic primitives to derive spin outcomes.

- **SHA-256:** Used to generate seed commitments.
- **HMAC-SHA256:** Used in the outcome-generation mechanism.
- **Server Seed:** A secret value used by the server.
- **Client Seed:** A client-provided value.
- **Nonce:** A counter associated with successive spins.

The challenge encourages players to investigate whether these components are implemented and managed securely.

### ⚡ Real-Time Communication

WebSockets provide communication between the browser and the game server, allowing players to interact with the game and receive updated state.

### 🧠 Logic-Based Exploitation

The intended learning experience focuses on examining application behavior, tracing state transitions, and understanding how implementation flaws can undermine a cryptographic design.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| 🟢 Node.js | Server-side JavaScript runtime |
| 🚂 Express.js | HTTP server and application routing |
| 🔌 WebSockets (`ws`) | Real-time client-server communication |
| 🔑 SHA-256 | Cryptographic hashing |
| 🔐 HMAC-SHA256 | Keyed message authentication and outcome derivation |
| 🎨 HTML / CSS / JavaScript | Frontend and game interface |

---

## 🏗️ Architecture

```text
       👤 Player
           |
           v
    🌐 Web Interface
           |
           v
     🔌 WebSocket
           |
           v
    🟢 Node.js Server
           |
      +----+----+
      |         |
      v         v
  🔐 Seed     🎰 Game
  Management   Logic
      |         |
      +----+----+
           |
           v
    💰 Balance Check
           |
           v
    🏆 Flag Retrieval
```

---

## 🚀 Play the Challenge

### 🌐 Online Instance

**[Fair Gambling](https://fair-gambling.onrender.com/)**

Open the deployed application, inspect its behavior, and work toward capturing the flag.

### 💻 Run Locally

Clone the repository:

```bash
git clone https://github.com/sillysaad/Fair-Gambling/
cd Fair-Gambling
```

Install dependencies:

```bash
npm install
```

Start the application using the script defined in `package.json`:

```bash
npm start
```

If no start script is configured, check the project instructions and run the server entry point directly.

Open the local URL displayed by the server.

> **Note:** Local execution may require environment variables or configuration depending on your deployment setup.

---

## 🧩 Hints for Players

<details>
  <summary>💡 Hint 1 — Observe the Game</summary>

  Don't focus only on the slot-machine interface. Inspect the messages exchanged between the browser and the server.
</details>

<details>
  <summary>💡 Hint 2 — Follow the Seeds</summary>

  Understand when the server seed is committed, when it is revealed, and how the client seed and nonce affect the outcome.
</details>

<details>
  <summary>💡 Hint 3 — Question the State Transitions</summary>

  Examine what happens when a seed is rotated. Does the server preserve the expected relationship between a commitment, its corresponding seed, and the spins generated from it?
</details>

---

## 🎓 Learning Objectives

By solving this challenge, players can practice:

- 🔍 Web application reconnaissance and source-code analysis.
- 🔐 Understanding cryptographic commitments and HMAC-based constructions.
- 🧠 Identifying business-logic and state-management vulnerabilities.
- 🔌 Inspecting WebSocket communication.
- 🧪 Developing and testing a reproducible exploit.
- 🛡️ Understanding why cryptographic primitives cannot compensate for incorrect application logic.

---

## ⚠️ Responsible Use

This project is intended for cybersecurity education, CTF practice, and authorized security testing.

Only interact with the provided challenge instance or environments you are authorized to test. Do not attempt to disrupt the hosting infrastructure or access unrelated systems.

---

## 👨‍💻 Author

**Saaduddin Shaikh**

Computer Engineering (CS & IoT) student interested in cybersecurity, software development, and secure application design.

<p align="center">
  <a href="https://fair-gambling.onrender.com/">
    <img src="https://img.shields.io/badge/Ready_to_Play%3F-Enter_the_Casino-6C63FF?style=for-the-badge" alt="Enter the Casino"/>
  </a>
</p>

<p align="center">
  <b>🎰 Think critically. Trace the logic. Capture the flag. 🚩</b>
</p>

<p align="center">
  <a href="https://fair-gambling.onrender.com/">
    <img src="https://img.shields.io/badge/🌐_Explore_the_Live_Project-Visit_Now-6C63FF?style=for-the-badge" alt="Explore Live Project"/>
  </a>
</p>
<img width="1900" height="938" alt="image" src="https://github.com/user-attachments/assets/7daa8c1a-2de1-4a38-85bd-d6c99d529d13" />


<p align="center">
  ⭐ If you find this project interesting, consider giving the repository a star!
</p>
