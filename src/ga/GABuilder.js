import { Point } from '../geometry/Point';
import Chromosome from './Chromosome';

export class GABuilder {
    constructor(poolSize, itemList) {
        if (typeof GABuilder.counter === 'undefined') { GABuilder.counter = 0; }

        this.id = GABuilder.counter++;

        this.selectionNo = 0;
        this.poolSize = poolSize;
        this.genePool = [];
        this.itemList = itemList;
        this.initializeGA();
    }

    initializeGA() {
        this.selectionNo = 0;
        this.genePool = [];
        this.length = this.itemList.length;

        let initialChromosome; // = new Chromosome(this.length); // initialize it
        // initialChromosome.initialize(item_list);
        // this.genePool.push(initialChromosome)

        // create the pool
        for (let i = 0; i < this.poolSize; i++) {
            // let newCh = initialChromosome.populate(4); // populate according to mutation type4
            // this.genePool.push(newCh);

            initialChromosome = new Chromosome(this.length); // initialize it
            initialChromosome.initialize2(this.itemList);
            this.genePool.push(initialChromosome);
        }

        this.sortByFitness();

        return this;
    }

    sortByFitness(type = 0) {
        if (type) {
            this.genePool.sort((a, b) => a.fitnessValue - b.fitnessValue);
        } else {
            this.genePool.sort((a, b) => b.fitnessValue - a.fitnessValue);
        }
    }

    prev() {
        this.selectionNo = Math.max(0, --this.selectionNo);
        const ch = this.genePool[this.selectionNo];
        ch.redraw(true);
    }

    next() {
        this.selectionNo = Math.min(this.poolSize - 1, ++this.selectionNo);
        const ch = this.genePool[this.selectionNo];
        ch.redraw(true);
    }

    best() {
        return this.genePool[0];
    }

    evolve() {
        // var t0 = performance.now();

        // 1. eliminate the second half
        const half = Math.floor(this.genePool.length / 2); // half is floored if it is half of an odd number
        this.genePool.splice(half); // delete starting from half to the end

        // 2. populate the best one by performing mutation and place them in the second half
        const amount = half; // length/2 changes acc. to being odd or even

        for (let i = 0; i < amount - 2; i++) {
            const chr = this.genePool[i % 3];
            const rand = Math.random();
            if (rand > 0.3) {
            // this.genePool.push(chr.populate(7, Math.round(chr.length * Math.random())));
                this.genePool.push(chr.populate(7, 5));
            } else if (rand > 0.5) {
                this.genePool.push(chr.populate(7, 3));
            // this.genePool.push(chr.populate(7, 3));
            } else {
                const initialChromosome = new Chromosome(this.length); // initialize it
                initialChromosome.initialize2(this.itemList);
                initialChromosome.localSearch();
                this.genePool.push(initialChromosome);
            }
        }

        for (let i = 0; i < 2; i++) {
            const initialChromosome = new Chromosome(this.length); // initialize it
            initialChromosome.initialize2(this.itemList);
            initialChromosome.localSearch();
            this.genePool.push(initialChromosome);
        }

        for (let i = 0; i < this.genePool.length; i++) {
            this.genePool[i].localSearch();
        }

        // 3. sort them again
        this.sortByFitness();

        // debug
        // console.log(this.genePool)

        // var t1 = performance.now()
        // console.log("evolution took " + (t1 - t0).toFixed(3) + " milliseconds.")
    }

    mutate(type, amount) {
        const ch = this.genePool[this.selectionNo];
        const t0 = performance.now();

        ch.mutate(type, amount);
        const t1 = performance.now();

        ch.redraw(true);

        console.log(`mutation took ${(t1 - t0).toFixed(3)} milliseconds.`);
        console.log(this.selectionNo, 'th chromosome mutated');
    }

    localSearch() {
        const ch = this.genePool[this.selectionNo];
        // let id = settings.selectedBlock;

        for (let id = Math.floor(ch.length / 10); id < ch.length; id++) { // except the first one
            ch.chromosome[id].localSearch();
        }
    }

    getSize() {
        const temp = this.genePool[0].bbox;
        return new Point(temp.width, temp.height);
    }
}
