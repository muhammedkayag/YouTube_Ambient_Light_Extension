# YouTube Ambient Light Extension

A lightweight Chrome Extension designed to enhance the YouTube viewing experience by creating an immersive ambient lighting effect around the video player, similar to modern Smart TV lighting systems (e.g., Ambilight).

---

## Features

- **Dynamic Ambient Lighting**: Automatically extracts colors from the playing video and projects a soft glow around the player frame.
- **Customizable Controls**: Turn the effect on/off, adjust blur radius, glow spread, and brightness via an easy-to-use extension popup interface.
- **Performance Optimized**: Uses lightweight DOM manipulation and CSS filters to minimize CPU/GPU usage during video playback.
- **Theater & Fullscreen Support**: Seamlessly adapts to YouTube's default view, theater mode, and full-screen modes.

---

## Project Structure

```text
ambient-center/
├── manifest.json       # Extension configuration and permissions
├── content.js          # Core logic for video frame sampling and dynamic glow update
├── content.css         # Styling for ambient glow canvas and placement
└── popup/
    ├── popup.html      # UI structure for extension control panel
    └── popup.js        # Logic for user preferences and settings persistence
```

---

## Installation

Since this extension is not currently on the Chrome Web Store, you can load it manually using Developer Mode:

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/your-username/youtube-ambient-light.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click on the **Load unpacked** button in the top-left corner.
5. Select the `ambient-center` directory from your cloned repository.

---

## Usage

1. Navigate to any video on [YouTube](https://www.youtube.com).
2. Click on the **Ambient Light** extension icon in your Chrome toolbar to open the settings menu.
3. Toggle the switch to activate or deactivate the glow.
4. Customize settings like brightness, blur size, or dynamic speed to your liking.

---

## Tech Stack

- **Manifest V3**
- **JavaScript (ES6+)**
- **CSS3** (Transitions, Filters, Custom Properties)
- **HTML5 Canvas** (for frame color processing)

---

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/muhammedkayag/youtube-ambient-light/issues) if you want to report a bug or suggest an improvement.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---


