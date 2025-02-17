# Flask-SocketIO Chat Application

This project is a real-time messaging application built using Flask and Flask-SocketIO. It allows users to select their names and rooms, send messages, and supports end-to-end encryption using a Caesar cipher.

## Features

- **Client Name Selection**: Users can choose their display names before joining a chat room.
- **Room Selection**: Users can select which chat room they want to join.
- **Real-Time Messaging**: Messages are sent and received in real-time using WebSockets.
- **Disconnection Handling**: Users are notified when someone disconnects from the chat.
- **End-to-End Encryption**: Messages are encrypted and decrypted using a Caesar cipher for added security.

## Project Structure

```
flask-socketio-chat
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── static
│   │   ├── css
│   │   │   └── styles.css
│   │   └── js
│   │       └── chat.js
│   ├── templates
│   │   └── chat.html
│   └── utils
│       └── encryption.py
├── requirements.txt
└── README.md
```

## Setup Instructions

1. **Clone the Repository**:
   ```
   git clone <repository-url>
   cd flask-socketio-chat
   ```

2. **Create a Virtual Environment**:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install Dependencies**:
   ```
   pip install -r requirements.txt
   ```

4. **Run the Application**:
   ```
   python -m app.main
   ```

5. **Access the Chat Application**:
   Open your web browser and go to `http://localhost:5000`.

## Usage Guidelines

- Upon accessing the application, users will be prompted to enter their name and select a chat room.
- Users can send messages to the selected room, and all participants will receive the messages in real-time.
- Messages are encrypted before being sent and decrypted upon receipt, ensuring privacy.

## Dependencies

- Flask
- Flask-SocketIO
- Other necessary libraries listed in `requirements.txt`

## License

This project is licensed under the MIT License. See the LICENSE file for more details.