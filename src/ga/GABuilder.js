import Chromosome from "./Chromosome"

class GABuilder{
    
    constructor(){
        this.selectionNo = 0;
        this.poolSize = 0;
        this.length = 0;
        this.genePool = [];
    }

    initializeGA(poolSize, chromosomeLength, size_list){

        this.selectionNo = 0;
        this.genePool = [];
        this.poolSize = poolSize;
        this.length = chromosomeLength;

        let initialChromosome = new Chromosome(chromosomeLength); // initialize it
        initialChromosome.initialize(size_list);
        // this.genePool.push(initialChromosome)

        // create the pool
        for(var i=0; i < this.poolSize; i++){
            let newCh = initialChromosome.populate(4); // populate according to mutation type4
            this.genePool.push(newCh);
        }

        this.sortByFitness();
        
        return this;
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

    best(){
        return this.genePool[0];
    }

    evolve(){
        // 1. eliminate the second half
        let half = Math.floor(this.genePool.length/2); // half is floored if it is half of an odd number
        this.genePool.splice(half); // delete starting from half to the end

        // 2. populate the best one by performing mutation and place them in the second half
        let amount = half // length/2 changes acc. to being odd or even
        let chr = this.genePool[0];

        for(let i=0; i<amount; i++)
        {
            if(Math.random() > 0.5)
                this.genePool.push(chr.populate(5));
            else
                this.genePool.push(chr.populate(6));
        }

        // 3. sort them again
        this.sortByFitness();

        // debug
        console.log(this.genePool)

        return this.genePool[0];
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
}
export default new GABuilder();