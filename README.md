# Belgrade Family Events Map

An interactive map of family-friendly events in Belgrade, Serbia.

The application automatically collects weekend event information from the Russian-language Telegram channel [@mamakudaidem](https://t.me/mamakudaidem), extracts event venues using Google Gemini, finds their coordinates via OpenStreetMap, and displays them on an interactive map.

## Demo

[Open Belgrade Family Events Map](https://un-a.github.io/events-map/)

> **Note:** Event information is displayed in Russian because the data comes from a Russian-language Telegram channel.

## Features

* Interactive map with event markers
* Event details displayed in popups
* Direct link to the original Telegram post
* Google Maps link for each event location
* Filter events by day: **Saturday / Sunday / All**
* Automatic venue extraction using Google Gemini
* Automatic data updates every Friday
* Fully automated data processing with GitHub Actions

## How It Works

The project consists of an automated data pipeline and a lightweight frontend.

### 1. Collecting Event Data

A Node.js script uses the Telegram MTProto API through **GramJS** to retrieve the latest weekend event post from the source channel.

### 2. Extracting Venues

The event text is processed with **Google Gemini**, which identifies the names of places and venues mentioned in the announcement.

### 3. Geocoding

The extracted venues are sent to **Nominatim**, the geocoding service provided by OpenStreetMap, to obtain their geographic coordinates.

### 4. Generating Event Data

The processed information is saved as `events.json`, which is used by the frontend.

### 5. Displaying Events

The frontend uses **Leaflet** and **OpenStreetMap** to display the events on an interactive map.

Each marker provides:

* event name;
* link to the original Telegram post;
* link to the location in Google Maps.

### 6. Automatic Updates

A **GitHub Actions** workflow runs every Friday, executes the data collection pipeline, and updates the event data automatically.

## Tech Stack

### Backend / Data Processing

* **Node.js**
* **GramJS** — Telegram MTProto API
* **Google Gemini API** — venue extraction
* **Nominatim / OpenStreetMap** — geocoding

### Frontend

* **JavaScript**
* **Leaflet.js**
* **OpenStreetMap**

### Infrastructure

* **GitHub Actions** — scheduled data updates
* **GitHub Pages** — deployment

## Why I Built It

I built this project to make it easier for families in Belgrade to discover weekend events in one place.

The application automates the process of collecting event information from Telegram, identifying venues, and displaying them on a map with direct links to the original event posts and locations.
