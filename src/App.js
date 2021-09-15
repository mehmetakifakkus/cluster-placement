// import {Row, Col, Carousel} from 'react-bootstrap';
import paper from "paper";
import { Button, Container, Row, Col } from 'reactstrap';
import { Sketch } from './Sketch';
import {GABuilder} from "./ga/GABuilder"
import React from 'react';
import {initialize, getGA, getClusters, draw} from "./main";

import 'antd/dist/antd.css';
import { Tree, Slider, Input} from 'antd';

import settings from './Utils/Settings'
import { Point } from "./geometry/Point";
var path = require('path')

settings.sliderValue = 40;

const { TextArea } = Input;
const defaultText2 = "design1.ai, 1200, 1600\n"+ 
"design2.ai, 2400, 1600\n"+
"design3.ai, 120, 80\n"+
"renderdesign1.png, 800,800\n"+
"renderdesign2.png, 400,400\n"+
"renderdesign3.png, 1000,1000\n"+
"renderdesign4.png, 1200,1200\n"+
"sketchv1.jpeg, 800, 400\n"+
"sketchv2.jpeg, 240,120\n"+
"sketchv3.jpeg, 360,180";

const defaultText1 = "design1.ai\n"+ 
"design2.ai\n"+
"design3.ai\n"+
"renderdesign1.png, 800,800\n"+
"renderdesign2.png, 400,400\n"+
"renderdesign3.png, 1000,1000\n"+
"renderdesign4.png, 1200,1200\n"+
"sketchv1.jpeg, 800, 400\n"+
"sketchv2.jpeg, 240,120\n"+
"sketchv3.jpeg, 360,180";

const defaultText = 
// "idea.docx\n"+ 
"P, models\n"+
"P, renders\n"+
"P, designs\n"+
"5652.jpeg\n"+
"5653.jpeg\n"+
"5654.jpeg\n"+
"5655.jpeg\n"+
"5656.jpeg\n"+
"5657.jpeg\n"+
"5658.jpeg\n"+
"5659.jpeg\n"+
"5660.jpeg\n"+
"5661.jpeg\n"+
"5662.jpeg\n"+
"5663.psd\n" +
"5660_e1.psd\n"+
"5660_e2.psd\n"+
"5660_e3.psd\n"+
"5660_e4.psd\n"+
"5660_e5.psd\n"+
"5660_e6.psd\n"+
// "5660_e7.psd\n"+
// "5660_e8.psd\n"+
// "5660_e9.psd\n"+
// "5660_e10.psd\n"+
// "5660_e11.psd\n"+
// "5660_e12.psd\n"+
// "5661.psd\n"+
// "5662.psd\n"+
// "5663.psd\n"+
// "model1.3dm\n"+
// "model2.3dm\n"+
// "model3.3dm\n"+
// "modelmanu1.3dm\n"+
// "modelmanu2.3dm\n"+
// "modelmanu3.3dm\n"+
// "renderdesign4.png, 1200,1200\n"+
"sketchv1.jpeg, 800, 400\n"+
"sketchv2.jpeg, 240,120\n"+
"sketchv3.jpeg, 360,180\n"+
"selam.jpeg\n"+
"selam1.jpeg\n"+
"selam2.jpeg\n"+
"selam3.jpeg";



class App extends React.Component {

    state = {
        active_ch: 0,
        clusters: null,
        selectedGA: getGA()
    }

    getTreeData = () => {
        
        const traverse = (ga) => {

            let layout = ga.best();

            let obj = new Object();
            obj.title = ga.title;
            obj.key = ga.id;
            obj.data = ga;
            
            obj.children = layout.chromosome.map( (it) => {
                if(it.content instanceof GABuilder)
                    return traverse(it.content);
                else
                    return null;
            });

            obj.children = obj.children.filter(it => it !== null)

            return obj;
        }

        let treeData = traverse(getGA());
        console.log(treeData);
        
        console.log(treeData.data)
        this.setState({selectedGA: treeData.data}); // auto select root cluster
        this.setState({clusters: [treeData]});
    }

    onSelect = (selectedKeys, info) => {
        paper.project.activeLayer.removeChildren();
        console.log('selected', info.node.data);
        draw(info.node.data)
    
        this.setState({selectedGA: info.node.data});
        // console.log(this.state.selectedGA)
    }

    getTextInput = (e) =>{
        // console.log(e.target.value.split('\n'))
        this.setState({textInput: e.target.value.split('\n')})
    }

    sliderChange = (value) => {
        this.setState({sliderValue: value})
        settings.sliderValue = value;
        // console.log(value)
    }

    run = () => {
        initialize(this.state.textInput || defaultText.split('\n'));
        this.getTreeData();
    }

    evolve = () =>{
        this.state.selectedGA.evolve();
        
        paper.project.activeLayer.removeChildren();
        draw();
    }

    localSearch = ()=>{
        this.state.selectedGA.localSearch();
        
        paper.project.activeLayer.removeChildren();
        draw(this.state.selectedGA, new Point(0,0));
    }

    mutate(type){
        getGA().mutate(type);
        this.setState({ active_ch: getGA().selectionNo }) 
    }

    render() {
        
        return (
            <Container style={{ padding: '1rem' }}>
                <Sketch />
                
                    <h3 style={{"margin":"0px 0px 10px 0px"}}>Genetic Algorithm Solution for Block Placement</h3>
                <Row>
                    <Col md={4}>
                        <h5>Text List</h5>

                        <TextArea rows={10} onChange={this.getTextInput} defaultValue={defaultText}/>
                        <hr />
                        {/* <hr />
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
                        </Row>
                    */}
                        <Slider defaultValue={40} onAfterChange={this.sliderChange} marks={{0: 'Fill', 100: '2x1'}}/>
                        <hr/>
                        <Tree
                            autoExpandParent
                            defaultExpandAll
                            onSelect={this.onSelect}
                            treeData={this.state.clusters}
                        />

                       
                        <Row style={{"margin":"40px 30px -10px 0px"}}>
                            
                            <button type="button" id="run" className="btn btn-warning btn-sm" 
                                onClick={() => {this.run()}}>RUN</button>
                            <button type="button" id="run" className="btn btn-warning btn-sm" 
                                onClick={() => {this.evolve()}}>evolve</button>
                            <button type="button" id="run" className="btn btn-warning btn-sm" 
                                onClick={() => {this.localSearch()}}>local</button>
                                
                                {/* <br/>
                              <p>We can have info of <a href="#" onClick={()=>{console.log(getGA()?.genePool[GABuilder.selectionNo]);  this.getTreeData();}} className="alert-link"> active </a> chromosome.</p>           */}
                        </Row>
                        
                        <br />
                    </Col>

                    <Col md={8}>
                        <canvas id="paperCanvas" height="600" width="800" style={{ border: '2px solid black' }} />
                        <span style = {{margin: '10px'}}/>
                        <Row>
                            <div className="col-md-2">
                                <button type="button" id="prev" className="btn btn-warning btn-sm" onClick={() => { this.state.selectedGA.prev(); this.setState({ active_ch: this.state.selectedGA.selectionNo }) }}>prev</button>
                            </div>
                            <div className="col-md-4">
                                <span id="info_chromosome">Chr. no: {this.state.selectedGA?.selectionNo}</span>
                                <p id="info_fitness">Cluster fitness value: { this.state.selectedGA?.genePool[this.state.selectedGA.selectionNo].fitnessValue}</p>
                                {/* <span id="info_chromosome">Chr. no: {this.state.active_ch}</span> */}
                            </div>
                            <div className="col-md-2">
                                <button type="button" id="next" className="btn btn-warning btn-sm" onClick={() => { this.state.selectedGA.next(); this.setState({ active_ch: this.state.selectedGA.selectionNo }) }}>next</button>
                            </div>
                        </Row>
                    </Col>
                    
                </Row>

                

            </Container>

        );
    }
}

export default App;
