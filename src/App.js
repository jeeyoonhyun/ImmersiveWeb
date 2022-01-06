import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from './Pages/Home.js'
import About from './Pages/About.js'
import Page from './Pages/Page.js'
import Error from './Pages/Error.js'
import Day1 from './Pages/Day1.js'
import Day2 from './Pages/Day2.js'
import Day3 from './Pages/Day3.js'
import Day4 from './Pages/Day4.js'
import Day5 from './Pages/Day5.js'
import Day6 from './Pages/Day6.js'

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path='/' component={Home} exact />
        <Route path="/about" component={About} />
        <Route path="/page" component={Page} />
        <Route path="/day1" component={Day1} />
        <Route path="/day2" component={Day2} />
        <Route path="/day3" component={Day3} />
        <Route path="/day4" component={Day4} />
        <Route path="/day5" component={Day5} />
        <Route path="/day6" component={Day6} />
        <Route component={Error} />
      </Switch>
    </div>
  );
}

export default App;
