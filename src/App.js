// import {Row, Col, Carousel} from 'react-bootstrap';
import paper from "paper";
import { Button, Container, Row, Col } from 'reactstrap';
import { Sketch } from './Sketch';
import {GABuilder} from "./ga/GABuilder"
import React from 'react';

class App extends React.Component {

    state = {
        active_ch: 0
    }

    initialize(){
        paper.project.activeLayer.removeChildren();
        
        var t0 = performance.now()

        GABuilder.initializeGA(20, 10);
        
    
        var t1 = performance.now()
        console.log("initialization took " + (t1 - t0).toFixed(3) + " milliseconds.")
        GABuilder.genePool[0].draw(true);
        this.setState({ active_ch: 0}) 
    }

    mutate(type){
        GABuilder.mutate(type);
        this.setState({ active_ch: GABuilder.selectionNo }) 
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
                           ..... <a href="#" className="alert-link" onClick={() => { this.mutate(5) }}>mutate5-clearHalved</a> ....
                        </p>
                        <br/>
                        <br/>
                        <p>
                            <a href="#" className="alert-link" onClick={() => { this.mutate(6) }}>the last 3</a> 
                        </p>

                        <br/>
                        <p>
                            <a href="#" className="alert-link" onClick={() => {GABuilder.evolve(); GABuilder.best().redraw(true)}}>evolve</a> 
                        </p>
                        </Row>
                        

                        <hr/>
                        <Row style={{"margin":"-8px 0px -10px 5px"}}>
                            <div className="col-md-2">
                                <button type="button" id="prev" className="btn btn-warning btn-sm" onClick={() => { GABuilder.prev(); this.setState({ active_ch: GABuilder.selectionNo }) }}>prev</button>
                            </div>
                            <span id="info_chromosome">Chr. no: {this.state.active_ch}</span>
                            <div className="col-md-2">
                                <button type="button" id="next" className="btn btn-warning btn-sm" onClick={() => { GABuilder.next(); this.setState({ active_ch: GABuilder.selectionNo }) }}>next</button>
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
                                <b><u>General:</u></b><br/>
                                <p id="info_fitness">Fitness value: { (GABuilder.genePool[this.state.active_ch])? GABuilder.genePool[this.state.active_ch].fitnessValue : ''}</p>
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
