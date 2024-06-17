import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import CsvReader from './components/CsvReader'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<CsvReader />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
