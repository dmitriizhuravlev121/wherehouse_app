// Получаем доступ к элементам DOM
let video, productName, quantityInput, addButton, subtractButton;
let cameraStream;

document.addEventListener("DOMContentLoaded", () => {
    // Инициализация элементов DOM
    video = document.getElementById("camera"); // Изменено на "camera"
    productName = document.getElementById("productName");
    quantityInput = document.getElementById("quantity");
    addButton = document.getElementById("addButton");
    subtractButton = document.getElementById("subtractButton");

    if (!video || !productName || !quantityInput || !addButton || !subtractButton) {
        console.error("Не все элементы DOM найдены. Проверьте HTML.");
        return;
    }

    // Запускаем камеру и сканирование QR-кода
    startCamera();
    scanQRCode();
});

// Запускаем камеру
async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Ваш браузер не поддерживает доступ к камере.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        cameraStream = stream;
        video.play();
    } catch (error) {
        if (error.name === "NotAllowedError") {
            alert("Доступ к камере запрещен. Проверьте настройки браузера.");
        } else if (error.name === "NotFoundError") {
            alert("Камера не найдена. Убедитесь, что устройство имеет камеру.");
        } else {
            alert("Не удалось получить доступ к камере.");
            console.error("Ошибка доступа к камере:", error);
        }
    }
}

// Обработка сканированного QR-кода
function handleQRCode(data) {
    try {
        const scannedData = JSON.parse(data); // Парсим JSON из QR-кода
        const scannedProductID = scannedData.id; // ID товара
        const scannedProductName = scannedData.name; // Название товара

        // Обновляем интерфейс
        productName.innerText = scannedProductName;

        // Показываем форму
        document.getElementById("formContainer").style.display = "block";

        // Добавляем обработчики для кнопок
        addButton.onclick = () => sendRequest("add_stock", scannedProductID);
        subtractButton.onclick = () => sendRequest("subtract_stock", scannedProductID);

        // Кнопка "Сканировать заново"
        document.getElementById("rescanButton").onclick = () => {
            document.getElementById("formContainer").style.display = "none";
            scanQRCode();
        };
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
