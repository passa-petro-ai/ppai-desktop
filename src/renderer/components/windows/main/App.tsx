// todo: menubar ellipsis on overflow
import { MainLayout } from '@/renderer/components/layout/MainLayout';
import { Home } from '@/renderer/components/views/Home';
import {
	Route,
	RouterProvider,
	createHashRouter,
	createRoutesFromElements,
} from 'react-router-dom';

import SettingsLayout from '@/renderer/components/layout/SettingsLayout';
import ErrorPage from '@/renderer/components/views/ErrorPage';
import { settingsNavItems, fwiNavItems } from '@/renderer/config/nav';
import '@/renderer/styles/globals.scss';

import { ExistingProjectDialog } from '@/renderer/components/modals/ExistingProjectDialog';
import { NewProjectDialog } from '@/renderer/components/modals/NewProjectDialog';
import { GeometricRotationDialog } from '@/renderer/components/modals/GeometricRotationDialog';
import { GetRangeDialog } from '@/renderer/components/modals/GetRangeDialog';
import { CsgtFourierTransformDialog } from '@/renderer/components/modals/CsgtFourierTransformDialog';
import FwiLayout from '../../layout/FwiLayout';

export default function App() {
	const settingsIndex =
		settingsNavItems.find((item) => item.index) || settingsNavItems[0];

	const fwiIndex = fwiNavItems.find((item) => item.index) || fwiNavItems[0];
	const routes = (
		<Route path="/" element={<MainLayout />} errorElement={<ErrorPage />}>
			<Route path="fwi" element={<FwiLayout />}>
				{fwiNavItems.map((item) => {
					return (
						<Route
							key={item.title}
							path={item.href}
							element={<>{item.element}</>}
						/>
					);
				})}
			</Route>
			<Route path="settings" element={<SettingsLayout />}>
				{settingsNavItems.map((item) => {
					/* Dynamically add routes for settings */
					return (
						<Route
							key={item.title}
							path={item.href}
							element={<>{item.element}</>}
						/>
					);
				})}

				{settingsIndex && (
					<>
						<Route index path="*" element={<>{settingsIndex.element}</>} />
					</>
				)}
				{fwiIndex && (
					<>
						<Route index path="*" element={<>{fwiIndex.element}</>} />
					</>
				)}
			</Route>

			<Route index element={<Home />} />
			<Route path="*" element={<Home />} />
		</Route>
	);

	const router = createHashRouter(createRoutesFromElements(routes));

	return (
		<>
			<RouterProvider router={router} />
			<ExistingProjectDialog />
			<NewProjectDialog />
			<GeometricRotationDialog />
			<GetRangeDialog />
			<CsgtFourierTransformDialog />
		</>
	);
}
