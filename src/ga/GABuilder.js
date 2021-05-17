import Chromosome from "./Chromosome"

class GABuilder{
    
    constructor(){
        this.selectionNo = 0;
        this.poolSize = 0;
        this.length = 0;
        this.genePool = [];
    }

    initializeGA(poolSize, chromosomeLength, file_list){

        this.selectionNo = 0;
        this.genePool = [];
        this.poolSize = poolSize;
        this.length = chromosomeLength;

        let initialChromosome = new Chromosome(10); // initialize it
        initialChromosome.initialize(file_list);
        this.genePool.push(initialChromosome)

        // create the pool
        for(var i=1; i < this.poolSize; i++){
            let newCh = initialChromosome.populate(4); // populate according to mutation type4
            this.genePool.push(newCh);
        }

        this.sortByFitness();
    }

    sortByFitness(type){
        var type_ = type || 0;
        if(type_)
            this.genePool.sort(function(a, b) {return a.fitnessValue - b.fitnessValue;});
        else
            this.genePool.sort(function(a, b) {return b.fitnessValue - a.fitnessValue;});
    }


    prev(){
        this.selectionNo = Math.max(0, --this.selectionNo)
        let ch = this.genePool[this.selectionNo];
        ch.redraw(true);        
    }
    
    next(){
        this.selectionNo = Math.min(this.poolSize - 1, ++this.selectionNo)
        let ch = this.genePool[this.selectionNo];
        ch.redraw(true);
    }

    mutate(type){
        let ch = this.genePool[this.selectionNo];
        var t0 = performance.now();
        
        ch.mutate(type)
        ch.redraw(true);
        var t1 = performance.now()
        
        console.log("mutation took " + (t1 - t0).toFixed(3) + " milliseconds.")
        console.log(this.selectionNo, 'th chromosome mutated')
    }
    
    collisionRemover(){
        var t0 = performance.now();
    
        let ch = this.genePool[this.selectionNo];
        ch.noCollision();
        ch.redraw(true);
        // console.log(this.selectionNo, ' collision removed')
    
        var t1 = performance.now()
        console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
    }
}
export default new GABuilder();