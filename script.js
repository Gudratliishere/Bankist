'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2025-09-21T14:43:26.374Z',
    '2025-09-18T18:49:59.371Z',
    '2025-09-20T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'en-EN', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2025-09-21T14:43:26.374Z',
    '2025-09-18T18:49:59.371Z',
    '2025-09-20T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'ar-SY',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const formatDate = function (date) {
  const calcDaysPasssed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

  const daysPassed = calcDaysPasssed(new Date(), new Date(date));

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  const movDate = new Date(date);

  const day = `${movDate.getDate()}`.padStart(2, 0);
  const month = `${movDate.getMonth() + 1}`.padStart(2, 0);
  const year = movDate.getFullYear();
  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(currentAccount.locale).format(movDate);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const cominedMovDates = acc.movements.map((mov, i) => ({
    mov: mov,
    date: acc.movementsDates.at(i),
  }));

  if (sort) cominedMovDates.sort((a, b) => a.mov - b.mov);

  cominedMovDates.forEach(function (object, i) {
    const { mov, date } = object;

    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const displayDate = formatDate(date);

    const formattedMov = formatCurr(
      mov,
      currentAccount.locale,
      currentAccount.currency
    );
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const formatCurr = function (mov, locale, curr) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
  }).format(mov);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCurr(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(
    incomes.toFixed(2),
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurr(
    Math.abs(out.toFixed(2)),
    account.locale,
    account.currency
  );

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(
    interest.toFixed(2),
    account.locale,
    account.currency
  );
};

const createUsernames = function (accounts) {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

const display = function (account) {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

const startLogOutTimer = function () {
  const displayTimer = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${second}`;
    time--;

    if (time < 0) {
      clearInterval(interval);
      currentAccount = null;
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  };
  let time = 10;

  displayTimer();
  const interval = setInterval(displayTimer, 1000);
  return interval;
};

//Event handler
let currentAccount, interval;

currentAccount = account1;
display(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log(currentAccount);

    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(new Date());

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (interval) clearInterval(interval);
    interval = startLogOutTimer();

    display(currentAccount);
  } else {
    alert('Wrong username or pin!');
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const targetAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    targetAccount &&
    currentAccount.balance >= amount &&
    targetAccount?.username !== currentAccount.username
  ) {
    targetAccount.movements.push(amount);
    currentAccount.movements.push(amount * -1);

    currentAccount.movementsDates.push(new Date().toISOString());
    targetAccount.movementsDates.push(new Date().toISOString());

    display(currentAccount);

    clearInterval(interval);
    interval = startLogOutTimer();
  } else {
    alert('Cannot transfer');
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    currentAccount = null;
    containerApp.style.opacity = 0;
  } else {
    alert('Wrong username or pin!');
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount / 10)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      display(currentAccount);

      clearInterval(interval);
      interval = startLogOutTimer();
    }, 2500);
  } else {
    alert('You cannot loan this money!');
  }
  inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
