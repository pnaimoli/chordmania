.PHONY: build clean

CLIENT_DIR := client
BUILD_DIR := build
SERVER_DIR := server

build: clean
	mkdir -p $(BUILD_DIR)/client
	cd $(CLIENT_DIR) && npm install --no-audit --no-fund
	cd $(CLIENT_DIR) && npm run build
	cp -r $(CLIENT_DIR)/build/* $(BUILD_DIR)/client/
	mkdir -p $(BUILD_DIR)/chordmania
	cp -p $(SERVER_DIR)/{xmlserver.py,requirements.txt,wsgi.py,gunicorn_config.py} $(BUILD_DIR)/
	cp -p $(SERVER_DIR)/chordmania/*.py $(BUILD_DIR)/chordmania/

clean:
	rm -rf $(BUILD_DIR)
