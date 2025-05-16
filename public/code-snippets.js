// Code snippets for beginners
const codeSnippets = {
  python: {
    'hello-world': `# My first Python program
print("Hello, World!")

# Try changing the message and run again!
`,

    'variables': `# Variables in Python
name = "Alex"
age = 14
is_student = True

print("Name:", name)
print("Age:", age)
print("Is a student?", is_student)

# Your turn! Create your own variable and print it
my_variable = "Your value here"
print("My variable:", my_variable)
`,

    'input-output': `# Getting input from user
name = input("What is your name? ")
age = input("How old are you? ")

# Converting string input to integer
age = int(age)

print(f"Hello, {name}! In 5 years, you will be {age + 5} years old.")

# Try this program and answer the questions when prompted
`,

    'conditionals': `# If-else statements
age = int(input("Enter your age: "))

if age < 13:
    print("You're a child!")
elif age < 20:
    print("You're a teenager!")
else:
    print("You're an adult!")

# Try with different ages to see what happens
`,

    'loops': `# For loop
print("Counting from 1 to 5:")
for i in range(1, 6):
    print(i)

# While loop
print("\\nCountdown:")
countdown = 5
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Blast off!")
`
  },
  
  javascript: {
    'hello-world': `// My first JavaScript program
console.log("Hello, World!");

// Try changing the message and run again!
`,

    'variables': `// Variables in JavaScript
let name = "Alex";
let age = 14;
let isStudent = true;

console.log("Name:", name);
console.log("Age:", age);
console.log("Is a student?", isStudent);

// Your turn! Create your own variable and print it
let myVariable = "Your value here";
console.log("My variable:", myVariable);
`,

    'input-output': `// Getting input in JavaScript
// Note: In the browser, we would use prompt() 
// Here, we're simulating input that would have been provided by the user
const userInput = process.argv[2] || "Default Name";
console.log("Hello, " + userInput + "!");

// In this environment, you can actually provide the input through the Input box below
// Then it will be available via the process.stdin stream
console.log("Type something in the input box and run this program!");
`,

    'conditionals': `// If-else statements
// Simulating getting an age as input
let age = parseInt(process.argv[2]) || 15;

if (age < 13) {
    console.log("You're a child!");
} else if (age < 20) {
    console.log("You're a teenager!");
} else {
    console.log("You're an adult!");
}

// Try modifying the age variable to see what happens
`,

    'loops': `// For loop
console.log("Counting from 1 to 5:");
for (let i = 1; i <= 5; i++) {
    console.log(i);
}

// While loop
console.log("\\nCountdown:");
let countdown = 5;
while (countdown > 0) {
    console.log(countdown);
    countdown--;
}
console.log("Blast off!");
`
  }
}; 