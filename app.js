document.addEventListener("DOMContentLoaded", () => {
    const camera = document.getElementById("camera");
    const formContainer = document.getElementById("formContainer");
    const productName = document.getElementById("productName");
    const quantityInput = document.getElementById("quantity");
    const addButton = document.getElementById("addButton");
    const subtractButton = document.getElementById("subtractButton");
    const rescanButton = document.getElementById("rescanButton");
    const errorMessage = document.getElementById("errorMessage");

    let scannedProduct = null;
    let streamActive = false;

    // Запуск камеры
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            camera.srcObject = stream;
            camera.play();
            streamActive = true;

            // Начинаем автоматическое сканирование
            startScanning();
        } catch (error) {
            alert("Не удалось получить доступ к камере.");
        }
    }

    // Автоматическое сканирование QR-кода
    function startScanning() {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const interval = setInterval(() => {
            if (camera.readyState === camera.HAVE_ENOUGH_DATA && !scannedProduct) {
                canvas.width = camera.videoWidth;
                canvas.height = camera.videoHeight;
                context.drawImage(camera, 0, 0, canvas.width, canvas.height);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, canvas.width, canvas.height);

                if (code) {
                    clearInterval(interval); // Останавливаем сканирование
                    scannedProduct = code.data;
                    productName.textContent = scannedProduct;
                    formContainer.style.display = "block";
                }
            }
        }, 500); // Проверяем каждые 500 мс
    }

    // Добавление поступления
    addButton.addEventListener("click", () => {
        sendRequest("add_stock");
    });

    // Списание товара
    subtractButton.addEventListener("click", () => {
        sendRequest("subtract_stock");
    });

    // Отправка запроса на бэкенд
    function sendRequest(action) {
        const quantity = quantityInput.value.trim();
        if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
            errorMessage.textContent = "Введите корректное количество.";
            return;
        }

        fetch(`https://your-backend-url/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: scannedProduct,
                quantity: parseInt(quantity),
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                alert("Операция выполнена успешно!");
                resetForm();
            })
            .catch((error) => {
                alert("Ошибка при выполнении операции.");
            });
    }

    // Сброс формы
    function resetForm() {
        scannedProduct = null;
        formContainer.style.display = "none";
        quantityInput.value = "";
        errorMessage.textContent = "";
        startScanning(); // Возобновляем сканирование
    }

    // Кнопка "Сканировать заново"
    rescanButton.addEventListener("click", () => {
        resetForm();
    });

    // Запуск камеры при загрузке страницы
    startCamera();
});