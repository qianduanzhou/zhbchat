import './App.scss';
import { useRoutes } from 'react-router-dom';
import { routes } from 'router/index'
import { AliveScope } from 'react-activation'
function App() {
	const reactRoutes = useRoutes(routes)
	return (
		<div className="App">
			<AliveScope>
				{reactRoutes}
			</AliveScope>
		</div>
	);
}

export default App;