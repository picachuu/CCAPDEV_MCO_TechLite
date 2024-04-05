## Project TechLite
<p align="justify">
TechLite is an innovative web-based platform designed to elevate the gaming experience for enthusiasts and casual gamers alike. This project aims to streamline the process of reserving high-performance gaming workstations, accessing a variety of services including food ordering and printing, and enhancing user engagement through rewards and a comprehensive service offering. TechLite bridges the gap between high-end gaming requirements and convenience, ensuring every gamer finds exactly what they need for an unforgettable gaming session.
</p>

## Prerequisites
Node.js and Node Package Manager must be installed. You can download and install the following from https://nodejs.org/.

## Installation

Clone the repo:

```bash
git clone https://github.com/picachuu/CCAPDEV_MCO_TechLite.git
```

Install the dependencies:

```bash
npm i express express-handlebars body-parser mongoose bcrypt multer express-session connect-mongodb-session
```

Load the database:

- Launch MongoDB Compass
- Run app.js to initialize the database:
```bash
cd NodeJS
node app.js
```
- Launch node app.js (to create database) and Ctrl + C to end the session
- Import all collections given in the json files within the samples zip corresponding to the collections in MongoDB Database/Compass

Run the application:

```bash
node app.js
```

Open [http://localhost:3000](http://localhost:3000) and take a look around.

## Usage
Users can navigate to the TechLite website to explore the range of services offered. Key features include:

- Workstation Reservation: Choose from various tiers of gaming workstations and reserve your slot in advance.
- Service Access: Order food, print documents, and redeem rewards directly from the platform.
- Profile Management: Users can create and manage their profiles, including viewing past reservations and managing current ones.
