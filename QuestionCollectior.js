// returns the URL of the generated text as a textFile (.txt, utf-8 style)
function makeTextFile(text) {
    var textFile = null;
    var data = new Blob([text], { type: 'text/plain;charset=utf8' });

    // Manually revoke the object URL to avoid memory leaks
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }
    
    textFile = window.URL.createObjectURL(data);
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
    var text = '';
    var content = element.querySelector('[class=item_content]');
    
    if (content) {
        for (let child of content.children) {
            if (child.innerText != '') {
                 text += child.innerText.trim() + '\n' + '$SEPERATOR$' + '\n';
            }
        }
    }
    //var text = element.innerText;
    return text;
}

// returns an array map (id -> element) of all 'Elements' which contains the identifier word
function findElementIdByName(identifier) {
    const elementArray = Array.from(document.querySelectorAll(identifier));
    const idArray = elementArray.map(({ id }) => [id]);
    return idArray;
}

// reutrns the id of the child element with class ".actionTile" in the provided element
function locateAnswerElement(arg1) {
    var testContainer = document.querySelector("#" + arg1);
    var ChildNode = testContainer.querySelectorAll(".actionTile"); //ChildNode is a NodeList
    ChildArray = Array.from(ChildNode); //Converts it to an array
    return ChildArray;
}

function getNextButton() {
    var nextButton = document.querySelector('[class=pager_forward_btn]');
    var actionTile = nextButton.querySelector('.actionTile');
    return actionTile;
}

// asynchronized processing for each page
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
            var test = document.getElementById(QuestionIdArray[i]);
            pageText += '$NEXT$' + '\n';
            pageText += getTextFromId(QuestionIdArray[i]) + '\n\n';
        }
        accumulatedText += pageText; // Accumulate text from this page

        // Check if there's a change in content after clicking the next page button
        const previousContent = document.body.innerHTML;
        const nextPageButton = getNextButton();
        //const nextPageButton = document.querySelector('#id_418'); // Replace with the correct selector for nextPageButton
        if (nextPageButton && currPage < maxPage - 1) { // - 1 because page array starts at 0, not 1
            nextPageButton.click();
            currPage++;
            await new Promise(resolve => setTimeout(resolve, 1250)); // Wait for the next page to load (adjust timing as needed)
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
            accumulatedText += '$END$';
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

let accumulatedText = '';
let currPage = 0;
let maxPage = document.querySelectorAll('[class*=pagerBtn]').length;
//const maxPage = getNumberOfPages - 1; // set to (lastPageNr - 1)
console.log(maxPage);
processPage();
