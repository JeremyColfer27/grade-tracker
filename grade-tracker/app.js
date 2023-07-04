

//grade-tracker: calculate and store overall grades for academic years.



//--------------------------------MODEL--------------------------------------------

//an Assignment represents a single assessable submission. 
//e.g exam, coursework, essay

//weighting - an assignment's percentage of its parent module's overall grade.
//mark - an achieved (or desired) score for the assignment. intended to be variable
class Assignment{
    constructor(weighting, mark, parentModule){
        this.changeWeighting(weighting);
        this.changeMark(mark);
        this.parentModule = parentModule || null;
    }

    //updates all upward model components affected by changing weight
    changeWeighting(newWeight){
        this.weighting = parseInt(newWeight);
        if(this.parentModule){
            this.parentModule.calculateAverage();
        }
    }

    //updates all upward model components affected by changing weight
    changeMark(newMark){
        this.mark = parseInt(newMark);
        if(this.parentModule){
            this.parentModule.calculateAverage();
        }
    }
}

//a Module (or unit) stores a collection of assignments 
//and provides information on credits and marks achieved.

//credits - pre-determined credit point value for a module
//assignments - array of assignments that contribute to module's mark
//module mark - module's overall achieved grade based on assignments' performance

class Module{
    constructor(title, credits, assignments, parent){
        this.title = title;
        this.credits = parseInt(credits);
        this.assignments = assignments;
        this.parentModuleCollection = parent;
        this.moduleGrade = this.calculateAverage();
        this.guiElement;
    }

    //return the weighted average mark of module's assignments
    //implicitly scales weightings that don't sum to 100%
    calculateAverage(){
        var weightSum = this.assignments
                        .reduce( (sum, ass) => sum + ass.weighting, 0);

        if (weightSum <= 0) return 0;//avoid zero-division

        this.moduleGrade = this.assignments
                        .reduce( (avg, ass) => avg + ass.mark * (ass.weighting / weightSum), 0);

        this.parentModuleCollection.calculateAverage();

        if(this.guiElement){
            console.log(this.moduleGrade);
            this.guiElement.textContent = `Module Grade: ${this.moduleGrade}`;
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
    constructor(title, weighting, modules, parent){
        this.title = title;
        this.modules = modules;
        this.weighting = parseInt(weighting);
        this.averageGrade = this.calculateAverage();
        this.parent = parent;
        this.guiElement;
    }

    //return  average grade of all modules, weighted by their credit points
    calculateAverage(){
        var creditSum = this.modules
                        .reduce( (sum, mod) => sum + mod.credits, 0);

        if (creditSum <= 0) return 0;//avoid zero-division

        console.log(`CS ${creditSum}`);
        this.averageGrade = this.modules
                            .reduce( (avg, mod) => avg + mod.moduleGrade * (mod.credits / creditSum), 0);

        if(this.guiElement){
            this.guiElement.textContent = `Collection Grade: ${this.averageGrade}`
        }

        console.log("collection average");
        this.parent.calculateAverage();

        return this.averageGrade;
    }
}

//an Overall Degree contains academic year information and calculates an
//overall degree classification

//academicYears - a list of moduleCollection s, each representing a single academic year
class OverallDegree{
    constructor(academicYears){
        this.academicYears = academicYears;
        this.classificationMark = this.calculateAverage();
    }

    calculateAverage(){
        var weightSum = this.academicYears
        .reduce( (sum, ay) => sum + ay.weighting, 0);

        if (weightSum <= 0) return 0;//avoid zero-division

        this.classificationMark = this.academicYears
                    .reduce( (avg, ay) => avg + ay.averageGrade * (ay.weightSum / weightSum), 0);
        console.log(this.classificationMark);
        return this.classificationMark;
    }
}

//--------------------------------CONTROLLER---------------------------------------

const myDegree =  new OverallDegree([]);

const addYearBtn = document.getElementById("add-year-button");
const yearTitleInput = document.getElementById("year-title-input");
const yearWeightingInput = document.getElementById("year-weighting-input");

addYearBtn.addEventListener("click", () => {
        var title = yearTitleInput.value;
        var weighting = yearWeightingInput.value;

        var myYear = new ModuleCollection(title, weighting, [], myDegree);
        myDegree.academicYears.push(myYear)
        var yearContainer = createDocElem('div', ['year-container'], '')
        var yearTitle = createDocElem('h2', ['year-title'], `${title}`);

        var collectionAverageText = createDocElem('p', ['collection-average'], `Collection Grade: `)
        myYear.guiElement = collectionAverageText;
        myYear.calculateAverage();

        appendChildren(yearContainer, [yearTitle, collectionAverageText]);
        appendChildren(document.body, [yearContainer])
        

        addModuleCollectionGUI(myYear, yearContainer);
    }
)

function addModuleCollectionGUI(moduleCollection, yearContainer){
    var modulesContainer = createDocElem('div', ['modules-container'], '');
    var moduleBuilder    = createDocElem('div', ['module-builder'], '');

    var titleControls = document.createElement('div', ['module-title-controls'], '');
    var titleLabel = createDocElem('label', [], `Module Title:`);
    var titleInput = createDocInput('text', [], "");

    var creditsControls = document.createElement('div', ['module-credits-controls'], '');
    var creditsLabel = createDocElem('label', [], `Credits:`);
    var creditsInput   = createDocInput('number', [], 20);

    var addModuleBtn = document.createElement('button');
    addModuleBtn.textContent = "add new module";
    addModuleBtn.addEventListener("click", () => 
    {
        if (titleInput.value.length <= 0 ) {window.alert("enter unit title")}
        else {
            addModuleGUI(moduleCollection, modulesContainer, titleInput.value, parseInt(creditsInput.value));
            titleInput.value = "";
        }
    }
    );
    
    appendChildren(titleControls, [titleLabel, titleInput]);
    appendChildren(creditsControls, [creditsLabel, creditsInput]);

    appendChildren(moduleBuilder, [titleControls, creditsControls, addModuleBtn]);
    appendChildren(yearContainer, [modulesContainer, moduleBuilder]);
}

function addModuleGUI(parentModuleCollection, modulesContainer, title, credits){
    var myModule = new Module(title, credits, [], parentModuleCollection);
    parentModuleCollection.modules.push(myModule);

    var moduleContainer = createDocElem('div', ['module-container'], '');
    var assignmentsContainer = createDocElem('div', ['assignments-container'], '');
    var assignmentBuilder = createDocElem('div', ['assignment-builder'], "");

    var moduleInfo = createDocElem('div', ['module-info'], '');

    var modTitle = createDocElem('h3', ['module-title'], `${title}`);
    var creditsInfo = createDocElem('p', ['credits-info'], `(${credits} credit points)`)
    appendChildren(moduleInfo, [modTitle, creditsInfo]);

    var moduleAverageText = createDocElem('p', ['module-average'], `Module Grade: `)
    myModule.guiElement = moduleAverageText;
    myModule.calculateAverage();

    // var weightingLabel = createDocElem('label', [], 'weight %:');
    // var weightingInput = createDocInput('number', [], 100);
    // var markLabel      = createDocElem('label', [], 'mark:');
    // var markInput      = createDocInput('number', [], 0);

    var addAssignmentBtn = createDocElem('button', [], 'Add New Assignment');
    addAssignmentBtn.addEventListener("click", () => 
    {
        var newAssigment = new Assignment(100, 0, myModule)
        myModule.assignments.push(newAssigment);
        myModule.calculateAverage();
        addAssignmentGUI(assignmentsContainer, newAssigment);
    }
    );

    appendChildren(assignmentBuilder, [addAssignmentBtn]);
    //appendChildren(assignmentBuilder, [weightingLabel, weightingInput, markLabel, markInput, addAssigmentBtn]);
    appendChildren(moduleContainer, [moduleInfo, moduleAverageText, assignmentsContainer, assignmentBuilder]);
    appendChildren(modulesContainer, [moduleContainer]);




}

function addAssignmentGUI(assignmentsContainer, assignment){
    var assignmentContainer = createDocElem('div', ['assignment-container'], '');

    var assignmentTitle = createDocElem('h4', ['assignment-title'], `assignment ${assignment.parentModule.assignments.length}`);

    var weightingControls = createDocElem('div', ['assignment-weighting-controls'], '');
    var weightingLabel = createDocElem('label', [], 'weight %:');
    var weightingInput = createDocInput('number', [], assignment.weighting);
    weightingInput.addEventListener("input", () => {
        assignment.changeWeighting(weightingInput.value);
    })

    appendChildren(weightingControls, [weightingLabel, weightingInput])

    var markControls = createDocElem('div', ['assignment-mark-controls'], '');
    var markLabel      = createDocElem('label', [], 'mark:');
    var markInput      = createDocInput('number', [], assignment.mark);
    markInput.addEventListener("input", () => {
        assignment.changeMark(markInput.value);
    })
    appendChildren(markControls, [markLabel, markInput])
    
    appendChildren(assignmentContainer, [assignmentTitle, weightingControls, markControls]);
    appendChildren(assignmentsContainer, [assignmentContainer]);
}
//-------------------------------FILE HANDLING--------------------------------------

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