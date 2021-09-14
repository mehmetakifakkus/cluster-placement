import { Point } from "../geometry/Point";
import Chromosome from "./Chromosome"

export class GABuilder{
    
    constructor(poolSize, item_list){
        if(typeof GABuilder.counter == 'undefined')
            GABuilder.counter = 0;

        this.id = GABuilder.counter++;

        this.selectionNo = 0;
        this.poolSize = poolSize;
        this.genePool = [];
        this.item_list = item_list;
        this.initializeGA();
    }

    initializeGA(){

        this.selectionNo = 0;
        this.genePool = [];
        this.length = this.item_list.length;

        let initialChromosome; // = new Chromosome(this.length); // initialize it
        // initialChromosome.initialize(item_list);
        // this.genePool.push(initialChromosome)

        // create the pool
        for(var i=0; i < this.poolSize; i++){
            // let newCh = initialChromosome.populate(4); // populate according to mutation type4
            // this.genePool.push(newCh);

            initialChromosome = new Chromosome(this.length); // initialize it
            initialChromosome.initialize2(this.item_list);
            this.genePool.push(initialChromosome);
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
        // var t0 = performance.now();

        // 1. eliminate the second half
        let half = Math.floor(this.genePool.length/2); // half is floored if it is half of an odd number
        this.genePool.splice(half); // delete starting from half to the end

        // 2. populate the best one by performing mutation and place them in the second half
        let amount = half // length/2 changes acc. to being odd or even
        
        for(let i=0; i < amount-2; i++)
        {
            let chr = this.genePool[i%3];
            let rand = Math.random();
            if(rand > 0.3)
                // this.genePool.push(chr.populate(7, Math.round(chr.length * Math.random())));
                this.genePool.push(chr.populate(7, 7));
            else if(rand > 0.5)
                this.genePool.push(chr.populate(7, 5));
            
            else
                // this.genePool.push(chr.populate(7, 3));
            {
                let initialChromosome = new Chromosome(this.length); // initialize it
                initialChromosome.initialize2(this.item_list);
                initialChromosome.localSearch();
                this.genePool.push(initialChromosome);
            }

        }
        
        for(let i=0; i < 2; i++)
        {
            let initialChromosome = new Chromosome(this.length); // initialize it
            initialChromosome.initialize2(this.item_list);
            initialChromosome.localSearch();
            this.genePool.push(initialChromosome);
        }

        for(let i=0; i<this.genePool.length; i++){
            this.genePool[i].localSearch();
        }

        // 3. sort them again
        this.sortByFitness();

        // debug
        // console.log(this.genePool)

        // var t1 = performance.now()
        // console.log("evolution took " + (t1 - t0).toFixed(3) + " milliseconds.")

    }

    mutate(type, amount){
        let ch = this.genePool[this.selectionNo];
        var t0 = performance.now();
        
        ch.mutate(type, amount)
        var t1 = performance.now()
        
        ch.redraw(true);
        
        console.log("mutation took " + (t1 - t0).toFixed(3) + " milliseconds.")
        console.log(this.selectionNo, 'th chromosome mutated')
    }

    getSize(){
        let temp = this.genePool[0].bbox;
        return new Point(temp.width, temp.height);
    }
}
