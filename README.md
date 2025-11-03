# Proxify

A small Node.js tool that scrapes public proxy lists and verifies which proxies can access a test URL (default: Google).
This tool provides http proxies.

---

## Features

- Scrapes multiple proxy sources (HTML and plain-text).
- Removes duplicate proxie entries
- Verifies proxies by sending an HTTP request to a configurable test URL.
- Stores raw proxies (`list.txt`) and verified proxies (`results.txt`).

---

## Requirements

- Node.js **16+**.
- Internet access to the proxy sources and the test URL.
- Create and write permissions in the project folder.

---

## Installation

```bash
git clone https://github.com/Jakub2841/Proxify
cd proxify
npm install
```

---

## Usage

```bash
node index.js
```
