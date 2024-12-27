import { createHashRouter } from 'react-router-dom';
import { DetailView } from './DetailView';
import RootView from './Root';
import ViewLibrary from './ViewLibrary';

const router = createHashRouter([
  {
    path: '/',
    Component: RootView,
    children: [
      {
        index: true,
        Component: ViewLibrary,
      },
      {
        path: 'detail/:trackId',
        Component: DetailView,
      },
    ],
  },
]);

export default router;
