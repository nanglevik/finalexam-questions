// Define a function to create a text file from the provided text content
function makeTextFile(text) {
    var textFile = null;
    var data = new Blob([text], { type: 'text/plain;charset=utf8' });

    // If we are replacing a previously generated file, manually revoke the object URL to avoid memory leaks
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // Return the URL for the text file
    return textFile;
}

// Define a function to click on the provided element
function clickElement(arg1) {
    arg1[0].click();
    return;
}

// Define a function to get the inner text content of an element by its id
function getTextFromId(id) {
    var element = document.getElementById(id);
    var text = element.innerText;
    return text;
}

// Define a function to find the id of all elements which ends with a certain string and form an array out of them
function findElementIdByName(arg1) {
    const elementArray = Array.from(document.querySelectorAll(arg1));
    const idArray = elementArray.map(({ id }) => [id]);
    return idArray;
}

// Define a function to locate the id of the child element with class ".actionTile" in the provided element
function locateAnswerElement(arg1) {
    var testContainer = document.querySelector("#" + arg1);
    var ChildNode = testContainer.querySelectorAll(".actionTile"); //ChildNode is a NodeList
    ChildArray = Array.from(ChildNode); //Converts it to an array
    return ChildArray;
}

// Define a variable to accumulate text from all pages
let accumulatedText = '';

// Define an async function to process each page
async function processPage() {
    try {
        // Forms an array consisting of all the id's of all elements with the string "questionItem" in the class
        const QuestionIdArray = findElementIdByName('[class*=questionItem]');

        // Creates an array containing the id's of each of the child elements of QuestionIdArray which contain .actionTile
        const AnswerIdArray = QuestionIdArray.map(locateAnswerElement);

        // Opens the answer for all questions on the page
        AnswerIdArray.forEach(clickElement);
        await new Promise(resolve => setTimeout(resolve, 500));

        // Iterate through the two arrays and accumulate the innerText contained in each
        let pageText = '';
        for (let i = 0; i < QuestionIdArray.length; i++) {
            pageText += getTextFromId(QuestionIdArray[i]) + '\n\n';
        }
        accumulatedText += pageText; // Accumulate text from this page

        // Check if there's a change in content after clicking the next page button
        const previousContent = document.body.innerHTML;
        const nextPageButton = document.querySelector('#id_418'); // Replace with the correct selector
        if (nextPageButton) {
            nextPageButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for the next page to load (adjust timing as needed)
            const currentContent = document.body.innerHTML;
            if (previousContent === currentContent) {
                console.log("End of pages reached.");
                // If there's no change in content, it means it's the last page
                // Generate the text file and open it
                const URLtext = makeTextFile(accumulatedText);
                window.open(URLtext);
                return; // Exit the function
            } else {
                await processPage(); // Recursively process the next page
            }
        } else {
            console.log("End of pages reached.");
            // If there's no next page button, it means it's the last page
            // Generate the text file and open it
            const URLtext = makeTextFile(accumulatedText);
            window.open(URLtext);
            return; // Exit the function
        }
    } catch (error) {
        console.error("Error processing page:", error);
    }
}

// Call the function to start processing pages
processPage();
