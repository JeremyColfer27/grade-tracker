

//grade-tracker: calculate and store overall grades for academic years.



//--------------------------------MODEL--------------------------------------------

//an Assignment represents a single assessable submission. 
//e.g exam, coursework, essay

//weighting - an assignment's percentage of its parent module's overall grade.
//mark - an achieved (or desired) score for the assignment. intended to be variable
class Assignment{
    constructor(weighting, mark){
        this.changeWeighting(weighting);
        this.changeMark(mark);
        // this.parentModule = parentModule || null;
    }

    //updates all upward model components affected by changing weight
    changeWeighting(newWeight){
        this.weighting = parseInt(newWeight);
        // if(this.parentModule){
        //     this.parentModule.calculateAverage();
        // }
    }

    //updates all upward model components affected by changing weight
    changeMark(newMark){
        this.mark = parseInt(newMark);
        // if(this.parentModule){
        //     this.parentModule.calculateAverage();
        // }
    }
}

//a Module (or unit) stores a collection of assignments 
//and provides information on credits and marks achieved.

//credits - pre-determined credit point value for a module
//assignments - array of assignments that contribute to module's mark
//module mark - module's overall achieved grade based on assignments' performance

class Module{
    constructor(title, credits, assignments){
        this.title = title;
        this.credits = parseInt(credits);
        this.assignments = assignments;
        // this.parentModuleCollection = parent;
        this.moduleGrade;
        this.guiElement;
    }

    //return the weighted average mark of module's assignments
    //implicitly scales weightings that don't sum to 100%
    calculateAverage(){

        var weightSum = this.assignments
                        .reduce( (sum, ass) => sum + (ass.weighting), 0);

        if (weightSum <= 0) return 0;//avoid zero-division

        this.moduleGrade = this.assignments
                        .reduce( (avg, ass) => avg + ass.mark * (ass.weighting / weightSum), 0);

        // this.parentModuleCollection.calculateAverage();

        if(this.guiElement){
            console.log(this.moduleGrade);
            this.guiElement.textContent = `Module Grade: ${this.moduleGrade.toFixed(1)}`;
        }

        return this.moduleGrade;
    }

}

//a ModuleCollection stores a collection of modules.
//e.g all the modules constituting a single academic year.

//modules - array of relevant modules
//averageGrade - weighted average grade based on module grades and their credit points
//weighting - percentage contribution to (for example) an entire degree classification
//parent - a collection of moduleCollections. Please suggest a better name haha.
class ModuleCollection{
    constructor(title, weighting, modules){
        this.title = title;
        this.modules = modules;
        this.weighting = parseInt(weighting);
        this.averageGrade;
        // this.parent = parent;
        this.guiElement = null;
    }

    //return  average grade of all modules, weighted by their credit points
    calculateAverage(){
        this.modules.forEach(m => m.calculateAverage());

        var creditSum = this.modules
                        .reduce( (sum, mod) => sum + mod.credits, 0);

        if (creditSum <= 0) return 0;//avoid zero-division

        console.log(`CS ${creditSum}`);
        this.averageGrade = this.modules
                            .reduce( (avg, mod) => avg + mod.moduleGrade * (mod.credits / creditSum), 0);

        if(this.guiElement){
            this.guiElement.textContent = `Collection Grade: ${this.averageGrade.toFixed(1)}`
        }

        console.log("collection average");
        // this.parent.calculateAverage();

        return this.averageGrade;
    }
}

//an Overall Degree contains academic year information and calculates an
//overall degree classification

//academicYears - a list of moduleCollection s, each representing a single academic year
class OverallDegree{
    constructor(academicYears){
        this.academicYears = academicYears;
        this.classificationMark;
        this.guiElement = null;
    }

    calculateAverage(){
        this.academicYears.forEach(ay => ay.calculateAverage());

        var weightSum = this.academicYears
        .reduce( (sum, ay) => sum + ay.weighting, 0);

        if (weightSum <= 0) return 0;//avoid zero-division

        this.classificationMark = this.academicYears
                    .reduce( (avg, ay) => avg + ay.averageGrade * (ay.weighting / weightSum), 0);
        console.log(this.classificationMark);

        this.guiElement.textContent = `degree grade: ${this.classificationMark.toFixed(1)}`;
        console.log(JSON.stringify(this));
        reconstructDegree(JSON.stringify(this));
        return this.classificationMark;
    }
}

//--------------------------------CONTROLLER---------------------------------------

var myDegree =  new OverallDegree([]);

const addYearBtn = document.getElementById("add-year-button");
const yearTitleInput = document.getElementById("year-title-input");
const yearWeightingInput = document.getElementById("year-weighting-input");


addYearBtn.addEventListener("click", () => {
        const title = yearTitleInput.value;
        const weighting = yearWeightingInput.value;

        const myYear = new ModuleCollection(title, weighting, []);
        myDegree.academicYears.push(myYear)
        const yearContainer = createDocElem('div', ['year-container'], '')
        const yearTitle = createDocElem('h2', ['year-title'], `${title}`);

        const collectionAverageText = createDocElem('p', ['collection-average'], `Collection Grade: `)
        myYear.guiElement = collectionAverageText;
        myYear.calculateAverage();

        appendChildren(yearContainer, [yearTitle, collectionAverageText]);
        appendChildren(document.body, [yearContainer])
        

        addModuleCollectionGUI(myYear, yearContainer, myDegree);
    }
)


function addModuleCollectionGUI(moduleCollection, yearContainer, degree){
    const modulesContainer = createDocElem('div', ['modules-container'], '');
    const moduleBuilder    = createDocElem('div', ['module-builder'], '');

    const titleControls = document.createElement('div', ['module-title-controls'], '');
    const titleLabel = createDocElem('label', [], `Module Title:`);
    const titleInput = createDocInput('text', [], "");

    const creditsControls = document.createElement('div', ['module-credits-controls'], '');
    const creditsLabel = createDocElem('label', [], `Credits:`);
    const creditsInput   = createDocInput('number', [], 20);

    const addModuleBtn = document.createElement('button');
    addModuleBtn.textContent = "add new module";
    addModuleBtn.addEventListener("click", () => 
    {
        if (titleInput.value.length <= 0 ) {window.alert("enter unit title")}
        else {
            addModuleGUI(moduleCollection, modulesContainer, titleInput.value, parseInt(creditsInput.value), degree);
            titleInput.value = "";
        }
    }
    );
    
    appendChildren(titleControls, [titleLabel, titleInput]);
    appendChildren(creditsControls, [creditsLabel, creditsInput]);

    appendChildren(moduleBuilder, [titleControls, creditsControls, addModuleBtn]);
    appendChildren(yearContainer, [modulesContainer, moduleBuilder]);
}

function addModuleGUI(parentModuleCollection, modulesContainer, title, credits, degree){
    const myModule = new Module(title, credits, []);
    parentModuleCollection.modules.push(myModule);

    const moduleContainer = createDocElem('div', ['module-container'], '');
    const assignmentsContainer = createDocElem('div', ['assignments-container'], '');
    const assignmentBuilder = createDocElem('div', ['assignment-builder'], "");

    const moduleInfo = createDocElem('div', ['module-info'], '');

    const modTitle = createDocElem('h3', ['module-title'], `${title}`);
    const creditsInfo = createDocElem('p', ['credits-info'], `(${credits} credit points)`)
    appendChildren(moduleInfo, [modTitle, creditsInfo]);

    const moduleAverageText = createDocElem('p', ['module-average'], `Module Grade: `)
    myModule.guiElement = moduleAverageText;
    myModule.calculateAverage();

    // var weightingLabel = createDocElem('label', [], 'weight %:');
    // var weightingInput = createDocInput('number', [], 100);
    // var markLabel      = createDocElem('label', [], 'mark:');
    // var markInput      = createDocInput('number', [], 0);

    const addAssignmentBtn = createDocElem('button', [], 'Add New Assignment');
    addAssignmentBtn.addEventListener("click", () => 
    {
        var newAssigment = new Assignment(100, 0, myModule)
        myModule.assignments.push(newAssigment);
        // myModule.calculateAverage();
        addAssignmentGUI(assignmentsContainer, newAssigment, myModule, degree);
    }
    );

    appendChildren(assignmentBuilder, [addAssignmentBtn]);
    //appendChildren(assignmentBuilder, [weightingLabel, weightingInput, markLabel, markInput, addAssigmentBtn]);
    appendChildren(moduleContainer, [moduleInfo, moduleAverageText, assignmentsContainer, assignmentBuilder]);
    appendChildren(modulesContainer, [moduleContainer]);




}

function addAssignmentGUI(assignmentsContainer, assignment, parentModule, degree){
    const assignmentContainer = createDocElem('div', ['assignment-container'], '');

    const assignmentTitle = createDocElem('h4', ['assignment-title'], `assignment ${parentModule.assignments.length}`);

    const weightingControls = createDocElem('div', ['assignment-weighting-controls'], '');
    const weightingLabel = createDocElem('label', [], 'weight %:');
    const weightingInput = createDocInput('number', [], assignment.weighting);
    weightingInput.addEventListener("input", () => {
        assignment.changeWeighting(weightingInput.value);
        myDegree.calculateAverage();
    })

    appendChildren(weightingControls, [weightingLabel, weightingInput])

    const markControls = createDocElem('div', ['assignment-mark-controls'], '');
    const markLabel      = createDocElem('label', [], 'mark:');
    const markInput      = createDocInput('number', [], assignment.mark);
    markInput.addEventListener("input", () => {
        assignment.changeMark(markInput.value);
        degree.calculateAverage();
    })
    appendChildren(markControls, [markLabel, markInput])
    
    appendChildren(assignmentContainer, [assignmentTitle, weightingControls, markControls]);
    appendChildren(assignmentsContainer, [assignmentContainer]);
}
//-------------------------------FILE HANDLING--------------------------------------

//button gets user-imported json file and reconstructs relevant classes for their grades
const restoreBtn = document.getElementById("restore-modules-data");
restoreBtn.addEventListener("input", async function(){
        const selectedFile = restoreBtn.files[0];
            if(selectedFile){
                await selectedFile.text().then(
                    sf => {
                        restoreEntireGUI(reconstructDegree(sf));
                    }
                )
            }

    }
);

//download current working degree class as json file. includes all assignments, modules etc
const downloadBtn = document.getElementById("download-modules-data");
downloadBtn.addEventListener("click", function(){

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(myDegree)));
        element.setAttribute('download', "grades.json");
      
        element.style.display = 'none';
        document.body.appendChild(element);
      
        element.click();
      
        document.body.removeChild(element);


})

//converts a json string into a valid OverallDegree object
function reconstructDegree(jsonstring){
    var tempObj = JSON.parse(jsonstring);
    console.log(tempObj);

    var newDegreeTemp = new OverallDegree(tempObj.academicYears);
    var newDegreeYears = [];
    //instantiates new degree, academicYear, module and assignment objects.
    //assignments for each module are instanitated, then module can be instantiated, 
    //which in turn help instantiate collections, in turn instantiating a whole degree
    for (ay of newDegreeTemp.academicYears){
        var newModules = []
        for(m of ay.modules){
            var newAssignments = [];
            for (a of m.assignments){
                var newAss = new Assignment(parseInt(a.weighting), parseInt(a.mark));
                newAssignments.push(newAss);
                console.log(newAss)
            }
            var newModule = new Module(m.title, m.credits, newAssignments);
            console.log(newModule)
            newModules.push(newModule);
        }
        var newAY = new ModuleCollection(
            ay.title, parseInt(ay.weighting), newModules
        )
        console.log(newAY)
        newDegreeYears.push(newAY);
    }
    var newDegree = new OverallDegree(newDegreeYears);
    console.log(newDegree.academicYears);


    return newDegree;

}

//based on a restored degree object, construct GUI elements needed to display grade data,
//and provide ability to modify and add new assignments, modules etc.
//similar structure to reconstruct degree: assignments need to be handled before modules.. etc...
//building up to the whole degree being visible and interactive
function restoreEntireGUI(someDegree){
    myDegree = someDegree;
    var cont = document.body;

    const degreeAverage = createDocElem('h1', ['degree-average-heading'], 'degreeAverage');

    someDegree.guiElement = degreeAverage;
    appendChildren(cont, [degreeAverage]);
    restoreModuleCollectionGUI(cont, someDegree.academicYears, someDegree);
    someDegree.calculateAverage();
}

function restoreModuleCollectionGUI(yearsContainer, academicYears, degree){
    console.log("restoring years....");
    const yearsGUI = []

    for(const ay of academicYears){
        var yearContainer = createDocElem('div', ['year-container'], '');

        const modulesContainer = createDocElem('div', ['modules-container'], '');
        const yearTitle = createDocElem('h3', ['year-title'], ay.title);
        //get modules for this year
        restoreModulesGUI(modulesContainer, ay.modules, degree)
        
        //create module builder for this year
        const moduleBuilder    = createDocElem('div', ['module-builder'], '');
        const titleControls = document.createElement('div', ['module-title-controls'], '');
        const titleLabel = createDocElem('label', [], `Module Title:`);
        const titleInput = createDocInput('text', [], "");
    
        const creditsControls = document.createElement('div', ['module-credits-controls'], '');
        const creditsLabel = createDocElem('label', [], `Credits:`);
        const creditsInput   = createDocInput('number', [], 20);
    
        const addModuleBtn = document.createElement('button');
        addModuleBtn.textContent = "add new module";
        addModuleBtn.addEventListener("click", () => 
        {
            console.log(titleInput.value)
            titleInput.style['background-color'] = 'red';
            if (titleInput.value.length <= 0 ) {window.alert("enter unit title")}
            else {
                addModuleGUI(ay, modulesContainer, titleInput.value, parseInt(creditsInput.value), degree);
                titleInput.value = "";
            }
        }
        );

        appendChildren(titleControls, [titleLabel, titleInput]);
        appendChildren(creditsControls, [creditsLabel, creditsInput]);
    
        appendChildren(moduleBuilder, [titleControls, creditsControls, addModuleBtn]);

        appendChildren(yearContainer, [yearTitle, modulesContainer, moduleBuilder]);
        yearsGUI.push(yearContainer);

    }
            
    appendChildren(yearsContainer, yearsGUI);
    return yearContainer;
}

//returns a div containing all given modules each in GUI form
//these modules each contain relevant assignments dynamically restored,
//and an assignment builder to add new assignemtns
function restoreModulesGUI(modulesContainer, modules, degree){
    console.log("restoring modules....");

    const modulesGUI = [];

    for(const m of modules){
        const moduleContainer = createDocElem('div', ['module-container'], '');
        const assignmentsContainer = createDocElem('div', ['assignments-container'], '');

        restoreAssignmentsGUI(assignmentsContainer, m.assignments, degree);
        
        const assignmentBuilder = createDocElem('div', ['assignment-builder'], "");

        const moduleInfo = createDocElem('div', ['module-info'], '');

        const modTitle = createDocElem('h3', ['module-title'], `${m.title}`);
        const creditsInfo = createDocElem('p', ['credits-info'], `(${m.credits} credit points)`)
        appendChildren(moduleInfo, [modTitle, creditsInfo]);
    
        const moduleAverageText = createDocElem('p', ['module-average'], `Module Grade: `)
        m.guiElement = moduleAverageText;

        // myModule.calculateAverage();
        const addAssignmentBtn = createDocElem('button', [], 'Add New Assignment');
        addAssignmentBtn.addEventListener("click", () => 
            {
                const newAssigment = new Assignment(100, 0)
                m.assignments.push(newAssigment);
                // myModule.calculateAverage();
                addAssignmentGUI(assignmentsContainer, newAssigment, m, degree);
            }
        );

        appendChildren(assignmentBuilder, [addAssignmentBtn]);

        appendChildren(moduleContainer, [moduleInfo, moduleAverageText, assignmentsContainer, assignmentBuilder]);

        modulesGUI.push(moduleContainer);
    }




    // var weightingLabel = createDocElem('label', [], 'weight %:');
    // var weightingInput = createDocInput('number', [], 100);
    // var markLabel      = createDocElem('label', [], 'mark:');
    // var markInput      = createDocInput('number', [], 0);



    //appendChildren(assignmentBuilder, [weightingLabel, weightingInput, markLabel, markInput, addAssigmentBtn]);
    
    appendChildren(modulesContainer, modulesGUI);

    return modulesContainer;
}

//returns a div, containing all given assignments each in GUI form (title, marks and weight adjustment inputs)
function restoreAssignmentsGUI(assignmentsContainer, assignments, degree){
    console.log("restoring assignments....");

    const assignmentsGUI = []//array of assignment document fragments
    i = 1; //to label each assignment if they don't have a title
    for (const a of assignments){
        console.log("AAA incoming:")
        console.log(a);
        const assignmentContainer = createDocElem('div', ['assignment-container'], '');

        const assignmentTitle = createDocElem('h4', ['assignment-title'], `assignment ${i}`);
    
        const weightingControls = createDocElem('div', ['assignment-weighting-controls'], '');
        const weightingLabel = createDocElem('label', [], 'weight %:');
        const weightingInput = createDocInput('number', [], a.weighting);
        weightingInput.addEventListener("input", () => {
            a.weighting = parseInt(weightingInput.value);
            // a.changeWeighting(parseInt(weightingInput.value));
            degree.calculateAverage();
        })
    
        appendChildren(weightingControls, [weightingLabel, weightingInput])
    
        const markControls = createDocElem('div', ['assignment-mark-controls'], '');
        const markLabel      = createDocElem('label', [], 'mark:');
        const markInput      = createDocInput('number', [], a.mark);
        markInput.addEventListener("input", () => {
            console.log("val", markInput.value)
            a.mark = parseInt(markInput.value);
            // a.changeMark(parseInt(markInput.value));
            degree.calculateAverage();
        })
        appendChildren(markControls, [markLabel, markInput])
        
        appendChildren(assignmentContainer, [assignmentTitle, weightingControls, markControls]);
        assignmentsGUI.push(assignmentContainer);
        i++;
    }

    appendChildren(assignmentsContainer, assignmentsGUI);
    return assignmentsContainer;

}

//--------------------------------HELPER FUNCTIONS-------------------------------------

//shortcut to add classnames, text content and input type to a doc. fragment in one line
//use empty array if no class name needed
//use empty string if text content not needed
function createDocElem(tag, classNamesArray, textContent){
    myElem = document.createElement(tag);

    if(classNamesArray.length > 0 ){
        for (cn of classNamesArray){
            myElem.classList.add(cn);
        }
    }

    if(textContent.length > 0){
        myElem.textContent = textContent;
    }

    if(tag == "input" && type.length > 0){
        myElem.type = type;
    }

    return myElem;
}

//similar to createDocElem but for inputs 
//asks for type and value instead of tag and textContent
function createDocInput(type, classNamesArray, value){
    myInput = document.createElement('input');

    if(classNamesArray.length > 0 ){
        for (cn of classNamesArray){
            myInput.classList.add(cn);
        }
    }

    myInput.type = type;

    //NEED TO ADD SOME VALIDATION HERE
    if(value){
        myInput.value = value;
    }

    return myInput;
}

//append an array of document fragments to a container
function appendChildren(container, children){
    children.forEach(c => container.appendChild(c))
}