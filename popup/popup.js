document.addEventListener('DOMContentLoaded', () => {
    // Загружаем сохраненные настройки
    chrome.storage.sync.get(['enableCasino', 'winChance'], (data) => {
        document.getElementById('enable-casino').checked = data.enableCasino !== false;
        document.getElementById('win-chance').value = data.winChance || 50;
    });

    // Сохраняем настройки
    document.getElementById('save-settings').addEventListener('click', () => {
        const settings = {
            enableCasino: document.getElementById('enable-casino').checked,
            winChance: parseInt(document.getElementById('win-chance').value)
        };

        chrome.storage.sync.set(settings, () => {
            alert('Настройки сохранены!');
            window.close();
        });
    });
});