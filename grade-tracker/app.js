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
        this.credits = credits;
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
        this.weighting = weighting;
        this.averageGrade = this.calculateAverage();
        this.parent = parent;
    }

    //return  average grade of all modules, weighted by their credit points
    calculateAverage(){
        var creditSum = this.modules
                        .reduce( (sum, mod) => sum + mod.credits, 0);

        if (creditSum <= 0) return 0;//avoid zero-division

        this.averageGrade = this.modules
                            .reduce( (avg, mod) => avg + mod.moduleGrade * (mod.credits / creditSum));

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

        this.classificationMark = this.modules
                    .reduce( (avg, ay) => avg + ay.averageGrade * (ay.weightSum / weightSum));

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

        var yearContainer = createDocElem('div', ['year-container'], '')
        document.body.appendChild(yearContainer);

        addModuleCollectionGUI(myYear, yearContainer);
    }
)

function addModuleCollectionGUI(moduleCollection, yearContainer){
    var modulesContainer = createDocElem('div', ['module-container'], '');
    var moduleBuilder    = createDocElem('div', 'module-container', '');

    var titleLabel = createDocElem('label', [], `Module Title:`);
    var titleInput = createDocInput('text', [], "");

    var creditsLabel = createDocElem('label', [], `Credits:`);
    var creditsInput   = createDocInput('number', [], 20);

    var addModuleBtn = document.createElement('button');
    addModuleBtn.textContent = "add module";
    addModuleBtn.addEventListener("click", () => 
    {
        if (titleInput.value.length <= 0 ) {window.alert("enter unit title")}
        else addModuleGUI(moduleCollection, modulesContainer, titleInput.value, creditsInput.value)
    }
    );
    
    appendChildren(moduleBuilder, [titleLabel, titleInput, creditsLabel, creditsInput, addModuleBtn]);
    appendChildren(yearContainer, [modulesContainer, moduleBuilder]);
}

function addModuleGUI(parentModuleCollection, modulesContainer, title, credits){
    var myModule = new Module(title, credits, [], parentModuleCollection);
    
    var assignmentsContainer = createDocElem('div', ['assignments-container'], '');
    var assignmentBuilder = createDocElem('div', ['assignment-builder'], "heyyy");

    var modTitle = createDocElem('h3', ['module-title'], `${title}`);
    var creditsInfo = createDocElem('p', ['credits-info'], `${credits} credit points`)
    var moduleAverageText = createDocElem('p', ['module-average'], `Module Grade: `)
    myModule.guiElement = moduleAverageText;
    myModule.calculateAverage();

    var weightingLabel = createDocElem('label', [], 'weight %:');
    var weightingInput = createDocInput('number', [], 100);
    var markLabel      = createDocElem('label', [], 'mark:');
    var markInput      = createDocInput('number', [], 0);

    var addAssigmentBtn = createDocElem('button', [], 'Add Assignment');
    addAssigmentBtn.addEventListener("click", () => 
    {
        var newAssigment = new Assignment(weightingInput.value, markInput.value, myModule)
        myModule.assignments.push(newAssigment);
        myModule.calculateAverage();
        addAssignmentGUI(assignmentsContainer, newAssigment);
    }
    );
    


    appendChildren(assignmentsContainer, [modTitle, creditsInfo, moduleAverageText]);


    appendChildren(assignmentBuilder, [weightingLabel, weightingInput, markLabel, markInput, addAssigmentBtn]);
    appendChildren(modulesContainer, [assignmentsContainer, assignmentBuilder]);




}

function addAssignmentGUI(assignmentsContainer, assignment){
    var assignmentContainer = createDocElem('div', ['assingment-container'], '');

    var assignmentTitle = createDocElem('h4', ['assignment-title'], `assignment ${assignment.parentModule.assignments.length}`);

    var weightingLabel = createDocElem('label', [], 'weight %:');
    var weightingInput = createDocInput('number', [], assignment.weighting);
    weightingInput.addEventListener("input", () => {
        assignment.changeWeighting(weightingInput.value);
    })

    var markLabel      = createDocElem('label', [], 'mark:');
    var markInput      = createDocInput('number', [], assignment.mark);
    markInput.addEventListener("input", () => {
        assignment.changeMark(markInput.value);
    })

    appendChildren(assignmentContainer, [assignmentTitle, weightingLabel, weightingInput, markLabel, markInput]);
    appendChildren(assignmentsContainer, [assignmentContainer]);
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