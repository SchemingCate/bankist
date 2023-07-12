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
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
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
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${account.balance.toFixed(2)}€`;
};

const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, curr) => acc + curr, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUI = acc => {
  // display movements
  displayMovements(acc.movements);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calcDisplaySummary(acc);
};

// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display ui and welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();

    // update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    console.log('Transfer valid');
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // update UI
    updateUI(currentAccount);
  }
});

// the bank grants a loan only if there is at least one deposit with at least 10% of the requested loan amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // add movement
    currentAccount.movements.push(amount);

    // update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    // delete account
    accounts.splice(index, 1);

    // hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let isSorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !isSorted);
  isSorted = !isSorted;
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

const eurToUsd = 1.1;

const movementsUSD = movements.map(mov => mov * eurToUsd);
// console.log(movements); // [ 200, 450, -400, 3000, -650, -130, 70, 1300 ]
// console.log(movementsUSD); // [ 220.00000000000003, 495.00000000000006, -440.00000000000006, 3300.0000000000005, -715.0000000000001, -143, 77, 1430.0000000000002 ]

const movementsUSDfor = [];
for (const mov of movements) {
  movementsUSDfor.push(mov * eurToUsd);
}
// console.log(movementsUSDfor); // [ 220.00000000000003, 495.00000000000006, -440.00000000000006, 3300.0000000000005, -715.0000000000001, -143, 77, 1430.0000000000002 ]

const movementsDescriptions = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
// console.log(movementsDescriptions);

const deposits = movements.filter(mov => mov > 0);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);

const withdrawals = movements.filter(mov => mov < 0);

// Reduce
// const balance = movements.reduce((acc, curr, i, arr) => {
//   console.log(`Iteration ${i}: ${acc}`);
//   return acc + curr
// }, 0);

const balance = movements.reduce((acc, curr) => acc + curr, 0);

// console.log(balance);

let balanceFor = 0;
for (const mov of movements) {
  balanceFor += mov;
}

// console.log(balanceFor);

//// maximum value
const max = movements.reduce(
  (acc, curr) => (acc > curr ? acc : curr),
  movements[0]
);
// console.log(max);

// chaining methods
const totalDepositsUSD = movements
  .filter(mov => mov > 0)
  .map((mov, i, arr) => {
    // console.log(arr); // We can inspect the current array at any stage of the pipeline using the third parameter of the callback function
    return mov * eurToUsd;
  })
  .reduce((acc, mov) => acc + mov, 0);

// console.log(totalDepositsUSD);

// FIND METHOD

const firstWithdrawal = movements.find(mov => mov < 0);

// console.log(movements);
// console.log(firstWithdrawal);
// the Find method only returns the first siutable element

// console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');
// console.log(account);

let accountForOf;
for (const account of accounts) {
  if (account.owner === 'Jessica Davis') {
    accountForOf = account;
    break;
  }
}
// console.log(accountForOf);

// --------- some and every

// console.log(movements);
// equality
// console.log(movements.includes(-130));

// some : condition
// console.log(movements.some(mov => mov === -130));

const anyDeposits = movements.some(mov => mov > 0);
// console.log(anyDeposits);

// every
// console.log(movements.every(mov => mov > 0));

// seperate callback
const isDeposit = mov => mov > 0;
// console.log(movements.some(isDeposit));
// console.log(movements.every(isDeposit));
// console.log(movements.filter(isDeposit));

// --------- flat and flatMap ES2019
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
// console.log(arr.flat()); // [ 1, 2, 3, 4, 5, 6, 7, 8 ]

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8];
// console.log(arrDeep.flat()); //  [ [1, 2], 3, 4, [5, 6], 7, 8 ]
// parameter = 1 - deep level:
// console.log(arrDeep.flat(2)); // [ 1, 2, 3, 4, 5, 6, 7, 8 ]

//
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance);

// flatMap - compines a map and a flat methods, better for performance
const overallBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
// console.log(overallBalance2);

//---------- sorting arrays
// Strings
const owners = ['Jonas', 'Zach', 'Adam', 'Martha'];
// console.log(owners.sort()); // [ "Adam", "Jonas", "Martha", "Zach" ]  sorted alphabetically
// sorting MUTATES the original array
// console.log(owners); // [ "Adam", "Jonas", "Martha", "Zach" ]

// Numbers
// console.log(movements); // [ 200, 450, -400, 3000, -650, -130, 70, 1300 ]
// console.log(movements.sort()); // [ -130, -400, -650, 1300, 200, 3000, 450, 70 ]
// the sort method does the sorting based on strings by default

// parameters a - current value, b - next value
// return < 0 A, B (keep order)
// return > 0 B, A (switch order)

// ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// });
movements.sort((a, b) => a - b);
// console.log(movements); // [ -650, -400, -130, 70, 200, 450, 1300, 3000 ]

// descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a);
//console.log(movements); // [ 3000, 1300, 450, 200, 70, -130, -400, -650 ]

//---------More Ways of Creating and Filling Arrays
const array = [1, 2, 3, 4, 5, 6, 7];

// Empty arrays + fill method
const x = new Array(7);
// if we pass only one argument, it creates a new empty array with that length
console.log(x); // [ <7 empty slots> ]
console.log(x.map(() => 5)); // [ <7 empty slots> ] // NOTHING HAPPEND
// one method that we can call on this empty array is fill method

// x.fill(1); // MUTATES the array
// console.log(x); // [ 1, 1, 1, 1, 1, 1, 1 ]

// parameters (element, begin[index where we want to start to fill], end (not included))
// x.fill(1, 3); // (element, begin[index where we want to start to fill])
// console.log(x); // [ <3 empty slots>, 1, 1, 1, 1 ]

x.fill(1, 3, 5);
console.log(x); // [ <3 empty slots>, 1, 1, <2 empty slots> ]

array.fill(23, 4, 6);
console.log(array); // [ 1, 2, 3, 4, 23, 23, 7 ]

// Array.from()
const y = Array.from({ length: 7 }, () => 1);
console.log(y); // [ 1, 1, 1, 1, 1, 1, 1 ]

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z); // [ 1, 2, 3, 4, 5, 6, 7 ]

// 100 random dice rolls
const diceRolls = Array.from({ length: 100 }, (_, __, arr) =>
  Math.floor(Math.random() * (8 - 1) + 1)
);
console.log(diceRolls);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => +el.textContent.replace('€', '')
  );
  console.log(movementsUI);
  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
});

// The Remainder Operator
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0, 2, 4, 6 ...
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    // 0, 3, 6, 9 ...
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
