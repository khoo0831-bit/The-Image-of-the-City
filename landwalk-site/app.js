/* GitHub Pages edition of the interactive controls; all data stays in the visitor's browser. */
(() => {
  const comparison = JSON.parse(document.querySelector('#comparison-data').textContent);
  const elements = JSON.parse(document.querySelector('#element-data').textContent);

  const filters = [...document.querySelectorAll('.filter-row button')];
  const cards = [...document.querySelectorAll('.city-card')];
  filters.forEach((button, index) => {
    button.type = 'button';
    button.addEventListener('click', () => {
      filters.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.setAttribute('aria-pressed', String(i === index));
      });
      comparison[index].cards.forEach((entry, i) => {
        cards[i].querySelector('.city-detail').innerHTML = entry.detail;
        cards[i].querySelector('.city-insight').innerHTML = entry.insight;
      });
    });
  });
  filters[0].setAttribute('aria-pressed', 'true');

  const tabs = [...document.querySelectorAll('.element-tabs [role="tab"]')];
  const diagram = document.querySelector('.city-diagram');
  const explainer = document.querySelector('.element-explainer');
  tabs.forEach((tab, index) => {
    tab.type = 'button';
    tab.addEventListener('click', () => {
      tabs.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        item.setAttribute('aria-selected', String(i === index));
      });
      diagram.setAttribute('class', elements[index].diagramClass);
      diagram.setAttribute('aria-label', elements[index].diagramAria);
      explainer.innerHTML = elements[index].explainer;
    });
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  const nameInput = document.querySelector('.city-name-label input');
  const scoreTitle = document.querySelector('.score-heading h3');
  const scoreValue = document.querySelector('.score-total strong');
  const sliders = [...document.querySelectorAll('.slider-row')];
  const result = document.querySelector('.diagnosis-result');
  const labels = sliders.map((row) => row.querySelector('.slider-name').childNodes[0].textContent.trim());
  const update = () => {
    const scores = sliders.map((row) => {
      const input = row.querySelector('input');
      const value = Number(input.value);
      input.style.setProperty('--score', `${(value - 1) * 25}%`);
      row.querySelector('output').textContent = String(value);
      return value;
    });
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    scoreValue.textContent = average.toFixed(1);
    scoreTitle.textContent = nameInput.value.trim() || '我的城市';
    result.querySelector('.result-status').textContent = average >= 3.8 ? '意象結構清楚' : average >= 2.6 ? '局部意象鮮明' : '整體意象仍待連結';
    const strongest = scores.indexOf(Math.max(...scores));
    const weakest = scores.lastIndexOf(Math.min(...scores));
    const values = result.querySelectorAll('div strong');
    values[0].textContent = labels[strongest];
    values[1].textContent = labels[weakest];
  };
  nameInput.addEventListener('input', update);
  sliders.forEach((row) => row.querySelector('input').addEventListener('input', update));
  update();

  const copyButton = result.querySelector('button');
  copyButton.type = 'button';
  copyButton.addEventListener('click', async () => {
    const scores = sliders.map((row, i) => `${labels[i]} ${row.querySelector('input').value}/5`);
    const content = `${scoreTitle.textContent}｜城市意象閱讀練習\n${scores.join('、')}\n平均 ${scoreValue.textContent}/5；${result.querySelector('.result-status').textContent}。`;
    try {
      await navigator.clipboard.writeText(content);
      const old = copyButton.firstChild.textContent;
      copyButton.firstChild.textContent = '已複製診斷摘要';
      setTimeout(() => { copyButton.firstChild.textContent = old; }, 1800);
    } catch {
      copyButton.firstChild.textContent = '複製失敗，請確認瀏覽器權限';
    }
  });
})();
