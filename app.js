document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-camera').addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: { exact: "environment" } } // Preferencia por la cámara trasera
            });
            const video = document.getElementById('camera-stream');
            if (video) {
                video.srcObject = stream;
                document.getElementById('take-photo').disabled = false;
            }
        } catch (error) {
            console.error("Error accessing the camera: ", error);
        }
    });

    document.getElementById('take-photo').addEventListener('click', () => {
        const video = document.getElementById('camera-stream');
        const canvas = document.getElementById('snapshot');
        const context = canvas.getContext('2d');
        const loader = document.getElementById('loader');
        const detectedAmountInput = document.getElementById('detected-amount');
        const capturedImage = document.getElementById('captured-image');
        const resultsDiv = document.getElementById('results');

        if (video && canvas && context && loader && detectedAmountInput && capturedImage && resultsDiv) {
            loader.style.display = 'block';
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async (blob) => {
                resultsDiv.innerHTML = "Procesando...";

                capturedImage.src = URL.createObjectURL(blob);

                try {
                    const { data: { text } } = await Tesseract.recognize(blob, 'spa', {
                        tessedit_char_whitelist: '0123456789.,'
                    });
                    
                    const importeMatch = text.match(/\b\d+[\.,]?\d*\b/);
                    const importe = importeMatch ? importeMatch[0].replace(',', '.') : 'No identificado';

                    detectedAmountInput.value = importe;
                } catch (error) {
                    console.error("Error recognizing text: ", error);
                    detectedAmountInput.value = 'Error';
                } finally {
                    loader.style.display = 'none';
                    document.getElementById('result-modal').style.display = 'block';
                }
            });
        } else {
            console.error("Some elements are missing in the DOM.");
        }
    });

    document.getElementById('confirm-amount').addEventListener('click', () => {
        const resultModal = document.getElementById('result-modal');
        const categoryModal = document.getElementById('category-modal');
        const importe = document.getElementById('detected-amount').value;

        if (resultModal && categoryModal && importe) {
            resultModal.style.display = 'none';
            categoryModal.style.display = 'block';
        } else {
            console.error("Some elements are missing in the DOM.");
        }
    });

    document.getElementById('save-category').addEventListener('click', () => {
        const categoryModal = document.getElementById('category-modal');
        const categorySelect = document.getElementById('category-select');
        const category = categorySelect.value;
        const importe = document.getElementById('detected-amount').value;
        const currentDate = new Date().toLocaleDateString();
        const resultsDiv = document.getElementById('results');

        if (category && importe && resultsDiv) {
            resultsDiv.innerHTML = `
                <p>Importe: ${importe}</p>
                <p>Tipo de Gasto: ${category}</p>
            `;

            const expensesTable = document.getElementById('expenses-table').getElementsByTagName('tbody')[0];
            const newRow = expensesTable.insertRow();
            newRow.insertCell(0).innerText = currentDate;
            newRow.insertCell(1).innerText = importe;
            newRow.insertCell(2).innerText = category;

            categoryModal.style.display = 'none';
        } else {
            console.error("Some elements are missing in the DOM.");
        }
    });

    window.onclick = (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    };

    const closeResultModal = document.getElementById('close-result-modal');
    if (closeResultModal) {
        closeResultModal.onclick = () => {
            document.getElementById('result-modal').style.display = 'none';
        };
    } else {
        console.error("Element 'close-result-modal' not found.");
    }

    const closeCategoryModal = document.getElementById('close-category-modal');
    if (closeCategoryModal) {
        closeCategoryModal.onclick = () => {
            document.getElementById('category-modal').style.display = 'none';
        };
    } else {
        console.error("Element 'close-category-modal' not found.");
    }
});
