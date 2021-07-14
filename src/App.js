// import {Row, Col, Carousel} from 'react-bootstrap';
import paper from "paper";
import { Button, Container, Row, Col } from 'reactstrap';
import { Sketch } from './Sketch';
import {GABuilder} from "./ga/GABuilder"
import React from 'react';
import {initialize, getGA, getClusters, draw} from "./main";

class App extends React.Component {

    state = {
        active_ch: 0
    }

    initialize(){
        paper.project.activeLayer.removeChildren();
        
        var t0 = performance.now()

        initialize();
        let ga = getGA();
        console.log(ga)
        this.setState({selectedGA: ga, active_ch: 0});
        

        var t1 = performance.now()
        console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
        ga.genePool[0].draw(true);
    }

    mutate(type){
        this.state.selectedGA.mutate(type);
        this.setState({ active_ch: this.state.selectedGA.selectionNo }) 
    }

    render() {
        return (
            <Container style={{ padding: '1rem' }}>
                <Row>
                    <h3 style={{"margin":"0px 0px 10px 10px"}}>Genetic Algorithm Solution for Block Placement</h3>
                    
                    <Col md={7}>
                        <canvas id="paperCanvas" height="600" width="640" style={{ border: '2px solid black' }} />
                    </Col>
                    <div className="col-md-5">
                        <h4>Available settings</h4><hr />
                        <hr />
                        <Row style={{"margin":"-8px 0px -10px 5px"}}>
                        <p> 
                             <a href="#" onClick={()=>{this.initialize()}} className="alert-link"> Reinitialize </a> the gene pool.
                        </p>
                        </Row>
                        <hr />

                        <Row style={{"margin":"-8px 0px -15px 5px"}}>
                        <p>
                            New placement <a href="#" className="alert-link" onClick={() => { this.mutate(4) }}>algo</a> on chr. {this.state.active_ch}
                        </p>
                        <br/>
                        <br/>
                        <p>
                           ..... <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(5); this.setState({ active_ch: this.state.selectedGA.selectionNo }); }}>mutate5-clearHalved</a> ....
                        </p>
                        <br/>
                        <br/>
                        <p>
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 1); this.setState({ active_ch: this.state.selectedGA.selectionNo }); }}>the last 1</a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 2); this.setState({ active_ch: this.state.selectedGA.selectionNo }); }}>, 2 </a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 3); this.setState({ active_ch: this.state.selectedGA.selectionNo }); }}>, 3 </a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 4); this.setState({ active_ch: this.state.selectedGA.selectionNo }); }}>, 4</a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 5); this.setState({ active_ch: this.state.selectedGA.selectionNo });}}>, 5</a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 6); this.setState({ active_ch: this.state.selectedGA.selectionNo });}}>, 6</a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 7); this.setState({ active_ch: this.state.selectedGA.selectionNo });}}>, 7</a> 
                            <a href="#" className="alert-link" onClick={() => { this.state.selectedGA.mutate(7, 8); this.setState({ active_ch: this.state.selectedGA.selectionNo });}}>, 8,  </a> 
                        </p>

                        <br/>
                        <p>
                            <a href="#" className="alert-link" onClick={() => {this.state.selectedGA.evolve(); this.state.selectedGA.best().redraw(true)}}>evolve</a> 
                        </p>
                        </Row>
                        

                        <hr/>
                        <Row style={{"margin":"-8px 0px -10px 5px"}}>
                            <div className="col-md-2">
                                <button type="button" id="prev" className="btn btn-warning btn-sm" onClick={() => { this.state.selectedGA.prev(); this.setState({ active_ch: this.state.selectedGA.selectionNo }) }}>prev</button>
                            </div>
                            <span id="info_chromosome">Chr. no: {this.state.active_ch}</span>
                            <div className="col-md-2">
                                <button type="button" id="next" className="btn btn-warning btn-sm" onClick={() => { this.state.selectedGA.next(); this.setState({ active_ch: this.state.selectedGA.selectionNo }) }}>next</button>
                            </div>
                                <br/>
                                <br/>
                              <p>We can have info of <a href="#" onClick={()=>{console.log(GABuilder.genePool[GABuilder.selectionNo]);}} className="alert-link"> active </a> chromosome.
                                </p>          
                        </Row>

                        

                        <br />
                        <h4>Best Item Statistics</h4> <hr />

                        <Row>
                            <div className="col-md-6">
                                <b><u>General:</u></b><br/>{console.log(this.state.active_ch)}
                                <p id="info_fitness">Fitness value: { (this.state.selectedGA)? this.state.selectedGA.genePool[this.state.active_ch].fitnessValue : ''}</p>
                            </div>
                      
                        </Row>
                        <br />
                    </div>

                </Row>

                <Sketch />

            </Container>

        );
    }
}

export default App;
