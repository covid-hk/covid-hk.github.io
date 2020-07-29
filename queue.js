/*
// https://www.javascripttutorial.net/javascript-queue/

// How to use

let q = new Queue();

for (let i = 1; i <= 7; i++) {
  q.enqueue(i);
}

// get the current item at the front of the queue
console.log(q.peek()); // 1

// get the current length of queue
console.log(q.length()); // 7

// dequeue all elements
while (!q.isEmpty()) {
  console.log(q.dequeue());
}
*/

function Queue() {
  this.elements = [];
}

Queue.prototype.enqueue = function (e) {
  this.elements.push(e);
};

// remove an element from the front of the queue
Queue.prototype.dequeue = function () {
  return this.elements.shift();
};

// check if the queue is empty
Queue.prototype.isEmpty = function () {
  return this.elements.length == 0;
};

// get the element at the front of the queue
Queue.prototype.peek = function () {
  return !this.isEmpty() ? this.elements[0] : undefined;
};

Queue.prototype.length = function() {
  return this.elements.length;
}
