const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: [],
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: "",
        capsLock: false,
        currentLayout: "QWERTY"
    },

    init() {
        // Create main elements
        this.elements.main = document.createElement("div");
        this.elements.keysContainer = document.createElement("div");

        // Setup main elements
        this.elements.main.classList.add("keyboard", "keyboard--hidden");
        this.elements.keysContainer.classList.add("keyboard__keys");
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.body.appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll(".use-keyboard-input").forEach(element => {
            element.addEventListener("focus", () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _createKeys() {
        const fragment = document.createDocumentFragment();

        const QWERTY = [
            "changeColour", "QWERTY", "DVORAK",
            "`","1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "backspace",
            "~","!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+",
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "{", "}", "[", "]", "\\",
            "caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ":", ";", "'", "\"", "enter",
            "done", "z", "x", "c", "v", "b", "n", "m", ",", ".", "<", ">", "/",  "?",
            "space"
        ];

        const DVORAK = [
            "changeColour", "QWERTY", "DVORAK",
            "~","%", "7", "5", "3", "1", "9", "0", "2", "4", "6", "8", "'", "backspace",
            "$", "&", "[", "{", "}", "(", "=", "*", ")", "+", "]", "!", "#",
            ";", ".", "/", "@", ",",
            ":", "<", ">", "p", "y", "f", "g", "c", "r", "l", "?", "^",
            "caps", "a", "o", "e", "u", "i", "d", "h", "t", "n", "s", "-", "|", "enter",
            "done", "\"", "q", "j", "k", "x", "b", "m", "w", "v", "z",
            "space"
        ];

        if (this.properties.currentLayout == "QWERTY") {
            layout = QWERTY;
            layoutMap = ["backspace", "+", "\\", "enter", "?", "DVORAK"]
        } else if (this.properties.currentLayout == "DVORAK") {
            layout = DVORAK;
            layoutMap = ["DVORAK", "backspace", "#", "^", "enter", "z"];
        }
        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class="material-icons">${icon_name}</i>`;
        };

        layout.forEach(key => {
            const insertLineBreak = layoutMap.indexOf(key) !== -1;

            // Add attributes/classes
            if  (key != "changeColour") {
                keyElement = document.createElement("button");
                keyElement.setAttribute("type", "button");
                keyElement.classList.add("keyboard__key");
            } else {
                keyElement = document.createElement("input");
                keyElement.setAttribute("type", "color");
                keyElement.setAttribute("value", "#004134");
            }

            switch (key) {
                case "changeColour":
                    keyElement.addEventListener("change", function() {
                        Keyboard._changeColor(this.value);
                    });
                    break;

                case "backspace":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("backspace");

                    keyElement.addEventListener("click", () => {
                        this.properties.value = this.properties.value.substring(0, this.properties.value.length - 1);
                        this._triggerEvent("oninput");
                    });

                    break;

                case "caps":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
                    keyElement.innerHTML = createIconHTML("keyboard_capslock");

                    keyElement.addEventListener("click", () => {
                        this._toggleCapsLock();
                        keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
                    });

                    break;

                case "enter":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.innerHTML = createIconHTML("keyboard_return");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += "\n";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "space":
                    keyElement.classList.add("keyboard__key--extra-wide");
                    keyElement.innerHTML = createIconHTML("space_bar");

                    keyElement.addEventListener("click", () => {
                        this.properties.value += " ";
                        this._triggerEvent("oninput");
                    });

                    break;

                case "done":
                    keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
                    keyElement.innerHTML = createIconHTML("check_circle");

                    keyElement.addEventListener("click", () => {
                        this.close();
                        this._triggerEvent("onclose");
                    });

                    break;

                case "QWERTY":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.textContent = "QWERTY";
                    keyElement.addEventListener("click", () => {
                        this.properties.currentLayout = "QWERTY";
                        this._changeLayout();
                    });

                    break;

                case "DVORAK":
                    keyElement.classList.add("keyboard__key--wide");
                    keyElement.textContent = "DVORAK";
                    keyElement.addEventListener("click", () => {
                    this.properties.currentLayout = "DVORAK";
                        this._changeLayout();
                    });

                    break;

                default:
                    keyElement.textContent = key.toLowerCase();

                    keyElement.addEventListener("click", () => {
                        this.properties.value += this.properties.capsLock ? key.toUpperCase() : key.toLowerCase();
                        this._triggerEvent("oninput");
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement("br"));
            }
        });

        return fragment;
    },

    _changeLayout() {
        while (this.elements.keysContainer.firstChild) {
            this.elements.keysContainer.firstChild.remove()
        }
        this.elements.keysContainer.appendChild(this._createKeys());
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == "function") {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;

        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = this.properties.capsLock ? key.textContent.toUpperCase() : key.textContent.toLowerCase();
            }
        }
    },

    _changeColor(colorCode) {
        this.elements.main.style.backgroundColor = colorCode;
    },

    open(initialValue, oninput) {
        this.properties.value = initialValue || "";
        this.eventHandlers.oninput = oninput;
    },

    close() {
        this.properties.value = "";
        this.eventHandlers.oninput = oninput;
    }
};

window.addEventListener("DOMContentLoaded", function () {
    Keyboard.init();
});
