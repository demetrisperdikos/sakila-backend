window.addEventListener('DOMContentLoaded', (event) => {
    fetch('/health-check')
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').textContent = "From Health Check: " + data;
        });
});
