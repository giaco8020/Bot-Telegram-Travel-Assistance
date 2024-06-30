## 🚂 Telegram Bot for Travel Assistance Applications 🚌

**BSc thesis project** in Computer Engineering.

### 📌 Objective

The aim of this project is to develop a Telegram bot to facilitate the search for travel tickets from major providers such as Trenitalia, Itabus, and Flixbus. This bot aims to provide users with a simple and intuitive platform to find and compare the best travel options.

### 🗂 Project Structure

- `src\data\modules`: Key modules for data acquisition from providers.
- `src\data\error`: Module for handling errors during function execution.
- `src\data\utils`: Contains modules for formatting responses (parsing functions) from various provider requests. This folder also includes a module named `manager.js` serving as a controller.

### 🌐 WebApp

The WebApp is developed in React. For integration with Telegram, the approach described in the [official Telegram guide](https://core.telegram.org/bots/webapps) has been followed.
