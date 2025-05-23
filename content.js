console.log("Контент-скрипт загружен");

setTimeout(() => {
    if (isLmsPage()) {
        injectCasinoInterface();
        updateDeadlineCount();
        setupMutationObserver();
    }
}, 1500);
// Проверка, что мы на странице LMS
function isLmsPage() {
    return document.querySelector('.badge__days') !== null ||
        window.location.href.includes('lms.');
}

// Вставка интерфейса казино
function injectCasinoInterface() {
    const casinoHTML = `
    <div id="lms-casino-container" style="
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      background: #1a1a2e; color: white; padding: 15px; border-radius: 8px;
      font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.5);
      width: 250px;
    ">
      <h3 style="margin: 0 0 10px 0; color: gold;">LMS Казино</h3>
      <div id="casino-balance" style="margin-bottom: 10px;">Дедлайнов: <span id="deadline-count">0</span></div>
      
      <div id="slots" style="
        display: flex; justify-content: space-around; font-size: 28px;
        background: #16213e; padding: 10px; border-radius: 5px;
        margin-bottom: 10px;
      ">
        <span>❓</span>
        <span>❓</span>
        <span>❓</span>
      </div>

      <input id="bet-amount" type="number" min="1" style="
        width: 100%; padding: 5px; border: none; border-radius: 4px;
        background: #0f3460; color: white; margin-bottom: 10px;
      ">
      <button id="spin-button" style="
        width: 100%; padding: 8px; background: #e94560; color: white;
        border: none; border-radius: 4px; cursor: pointer;
      ">Крутить!</button>
      <div id="casino-result" style="margin-top: 10px;"></div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', casinoHTML);

    document.getElementById('spin-button').addEventListener('click', spin);
}
// Подсчёт дедлайнов
function updateDeadlineCount() {
    try {
        const deadlineElements = document.querySelectorAll('.badge__days');
        let totalDeadlines = 0;

        deadlineElements.forEach(el => {
            const text = el.textContent.replace(/\D+/g, '');
            const count = parseInt(text) || 0;
            totalDeadlines += count;
            console.log(`Найден элемент:`, el, `Значение:`, count);
        });

        document.getElementById('deadline-count').textContent = totalDeadlines;
        return totalDeadlines;
    } catch (e) {
        console.error('Ошибка при подсчете дедлайнов:', e);
        return 0;
    }
}
function updateLmsDeadlineDisplay(newTotal) {
    const deadlineElements = document.querySelectorAll('.badge__days');
    const each = Math.floor(newTotal / deadlineElements.length);

    deadlineElements.forEach(el => {
        el.textContent = `${each} дней`; // адаптируй под LMS
    });
}

// Запуск наблюдателя за DOM
function setupMutationObserver() {
    let timeoutId = null;

    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            updateDeadlineCount();
        }, 300); // 300 мс после последнего изменения
    });

    const target = document.querySelector('#main-content') || document.body;

    observer.observe(target, {
        childList: true,
        subtree: true
    });

    console.log("MutationObserver запущен на", target);
}
// Крутить барабан
function spin() {
    const symbols = ['🍒', '🍋', '🔔', '💎', '🍀'];
    const betInput = document.getElementById('bet-amount');
    const slots = document.querySelectorAll('#slots span');
    const resultDiv = document.getElementById('casino-result');

    let betAmount = parseInt(betInput.value);
    let current = parseInt(document.getElementById('deadline-count').textContent) || 0;

    if (isNaN(betAmount) || betAmount < 1) {
        showResult("Некорректная ставка!", 'error');
        return;
    }

    if (betAmount > current) {
        showResult("Недостаточно дедлайнов!", 'error');
        return;
    }

    // Показываем вращение
    const spinButton = document.getElementById('spin-button');
    spinButton.disabled = true;
    spinButton.textContent = '...';

    // "Вращаем"
    const roll = setInterval(() => {
        slots.forEach(slot => {
            slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        });
    }, 100);

    setTimeout(() => {
        clearInterval(roll);

        // Окончательная комбинация
        const result = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
        ];

        result.forEach((sym, i) => slots[i].textContent = sym);

        const [a, b, c] = result;

        if (a === b && b === c) {
            const winAmount = betAmount * 2;
            showResult(`🎉 3 ${a}! Победа +${winAmount}`, 'win');
            current += winAmount;
        } else if (a === b || b === c || a === c) {
            const bonusAmount = Math.floor(betAmount * 1.25);
            showResult(`🥈 2 совпадения! Бонус +${bonusAmount}`, 'win');
            current += bonusAmount;
        } else {
            showResult(`😢 Нет совпадений. -${betAmount}`, 'lose');
            current -= betAmount;
        }

        document.getElementById('deadline-count').textContent = current;
        updateLmsDeadlineDisplay(current);

        spinButton.disabled = false;
        spinButton.textContent = 'Крутить!';
    }, 1500);
}

// Показ результата
function showResult(message, type) {
    const resultDiv = document.getElementById('casino-result');
    resultDiv.textContent = message;
    resultDiv.style.color = type === 'win' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#ecf0f1';
    resultDiv.style.textAlign = 'center';
    resultDiv.style.fontWeight = 'bold';
}
