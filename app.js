// Получаем доступ к элементам DOM
const video = document.getElementById("video");
const productName = document.getElementById("productName");
const quantityInput = document.getElementById("quantity");
const addButton = document.getElementById("addButton");
const subtractButton = document.getElementById("subtractButton");

let cameraStream;

// Запускаем камеру
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        cameraStream = stream;
        video.play();
    } catch (error) {
        alert("Не удалось получить доступ к камере.");
        console.error("Ошибка доступа к камере:", error);
    }
}

// Обработка сканированного QR-кода
function handleQRCode(data) {
    try {
        const scannedData = JSON.parse(data); // Парсим JSON из QR-кода
        const scannedProductID = scannedData.id; // ID товара
        const scannedProductName = scannedData.name; // Название товара

        // Обновляем интерфейс
        productName.innerText = `Товар: ${scannedProductName}`;

        // Добавляем обработчики для кнопок
        addButton.onclick = () => sendRequest("add_stock", scannedProductID);
        subtractButton.onclick = () => sendRequest("subtract_stock", scannedProductID);
    } catch (error) {
        alert("Неверный формат QR-кода.");
        console.error("Ошибка обработки QR-кода:", error);
    }
}

// Отправка запроса на бэкенд
function sendRequest(action, productID) {
    const quantity = quantityInput.value;

    if (!quantity || isNaN(quantity)) {
        alert("Введите корректное количество.");
        return;
    }

    fetch(`https://wherehouse-backend-fplp.onrender.com/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            product_name: productID, // Передаем ID товара
            quantity: parseInt(quantity),
        }),
    })
        .then(response => response.json())
        .then(data => {
            alert("Запрос выполнен успешно!");
            console.log("Ответ от сервера:", data);
        })
        .catch(error => {
            alert("Произошла ошибка при отправке запроса.");
            console.error("Ошибка:", error);
        });
}

// Сканирование QR-кода
function scanQRCode() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    function processFrame() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                handleQRCode(code.data); // Обрабатываем данные из QR-кода
            }
        }
        requestAnimationFrame(processFrame);
    }

    processFrame();
}

// Инициализация приложения
startCamera();
scanQRCode();
