const promiseCopy = {
  build: {
    kicker: 'First, the work',
    title: 'Something worth seeing.',
    copy: 'We agree on the direction, then turn the idea into a real piece of work you can look at, test and understand.',
    stamp: 'In progress'
  },
  deliver: {
    kicker: 'Next, the handover',
    title: 'The work is in your hands.',
    copy: 'We share the finished deliverable and make sure you know what has been made and how it serves the goal we agreed.',
    stamp: 'Delivered'
  },
  charge: {
    kicker: 'Then, the invoice',
    title: 'Payment follows delivery.',
    copy: 'Only after we have built and delivered the agreed work do we charge for our services. Clear work comes before a request for payment.',
    stamp: 'Ready to invoice'
  }
};

const tabs = [...document.querySelectorAll('[data-promise]')];
const panel = document.querySelector('#promise-panel');

function selectPromise(tab) {
  const content = promiseCopy[tab.dataset.promise];
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tab.id);
  panel.dataset.stage = tab.dataset.promise;
  panel.querySelector('#promise-kicker').textContent = content.kicker;
  panel.querySelector('#promise-panel-title').textContent = content.title;
  panel.querySelector('#promise-panel-copy').textContent = content.copy;
  panel.querySelector('#promise-art-label').textContent = content.stamp;
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPromise(tab));
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectPromise(tabs[next]);
    tabs[next].focus();
  });
});
