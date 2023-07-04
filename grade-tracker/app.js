//grade-tracker: calculate and store overall grades for academic years.



//--------------------------------MODEL--------------------------------------------

//an Assignment represents a single assessable submission. 
//e.g exam, coursework, essay

//weighting - an assignment's percentage of its parent module's overall grade.
//mark - an achieved (or desired) score for the assignment. intended to be variable
class Assignment{
    constructor(weighting, mark, parentModule){
        this.weighting = weighting;
        this.mark = mark;
        this.parentModule = parentModule || null;
    }

    //updates all upward model components affected by changing weight
    changeWeighting(newWeight){
        this.weighting = newWeight;
        if(this.parentModule){
            this.parentModule.calculateAverage();
        }
    }

    //updates all upward model components affected by changing weight
    changeMark(newMark){
        this.mark = newMark;
        if(this.parentModule){
            this.parentModule.calculateAverage();
        }
    }
}

//a Module (or unit) stores a collection of assignments 
//and provides information on credits and marks achieved.

//credits - pre-determined credit point value for a module
//assignments - array of assignments that contribute to module
//module mark - module's overall achieved grade based on assignments' performance

class Module{
    constructor(title, credits, assignments, parent){
        this.title = title;
        this.credits = credits;
        this.assignments = assignments;
        this.parentModuleCollection = parent;
        this.moduleGrade = this.calculateAverage();
    }

    //return the weighted average mark of module's assignments
    //implicitly scales weightings that don't sum to 100%
    calculateAverage(){
        var weightSum = this.assignments
                        .reduce( (sum, ass) => sum + ass.weighting, 0);

        if (weightSum <= 0) return 0;//avoid zero-division

        this.moduleGrade = this.assignments
                        .reduce( (avg, ass) => avg + ass.mark * (ass.weighting / weightSum));

        this.parentModuleCollection.calculateAverage();

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
    addModuleBtn.addEventListener("click", () => addModuleGUI(moduleCollection, modulesContainer, 
                                                              titleInput.value, creditsInput.value));
    
    appendChildren(moduleBuilder, [titleLabel, titleInput, creditsLabel, creditsInput, addModuleBtn]);
    appendChildren(yearContainer, [modulesContainer, moduleBuilder]);
}

function addModuleGUI(parentModuleCollection, modulesContainer, title, credits){
    var newModule = new Module(title, credits, [], parentModuleCollection);
    
    var assignmentBuilder = createDocElem('div', ['assignment-builder'], "heyyy");
    modulesContainer.appendChild(assignmentBuilder)

}


//shortcut to add classnames, text content and input type to doc. fragment in one line
//use empty array if no class name needed
//use empty strings if input type and text content not needed
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

function createDocInput(type, classNamesArray, value){
    myInput = document.createElement('input');

    if(classNamesArray.length > 0 ){
        for (cn of classNamesArray){
            myInput.classList.add(cn);
        }
    }

    myInput.type = type;

    if(value){
        myInput.value = value;
    }

    return myInput;
}

//append an array of document fragments to a container
function appendChildren(container, children){
    for (child of children){
        container.appendChild(child);
    }
}