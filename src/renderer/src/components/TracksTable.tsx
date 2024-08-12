import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Track } from '@preload/emusik';
import useLibraryStore from '@renderer/stores/useLibraryStore';
import useAppStore from '@renderer/stores/useAppStore';
import {
  CellContextMenuEvent,
  ColDef,
  FirstDataRenderedEvent,
  GridApi,
  GridReadyEvent,
  RowDoubleClickedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TracksTable = () => {
  // const { tracks, setTrackDetail, showCtxMenu, updatedTracks, setUpdatedTracks } = useAppState();
  const navigate = useNavigate();
  const tracks = useLibraryStore(state => state.tracks);
  const gridRef = useRef<AgGridReact>(null);
  const contentHeight = useAppStore(state => state.contentHeight);
  const showContextMenu = useAppStore(state => state.showContextMenu);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [rowData, setRowData] = useState<Track[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [colDefs, setColDefs] = useState([
    { field: 'title', minWidth: 150 },
    { field: 'artist', minWidth: 90 },
    { field: 'time', maxWidth: 90 },
    { field: 'album', minWidth: 90 },
    { field: 'genre', minWidth: 70 },
    { field: 'year', maxWidth: 70 },
    { field: 'bpm', maxWidth: 70 },
    { field: 'bitrate', minWidth: 80, maxWidth: 90 },
    { field: 'key', maxWidth: 70 },
  ]);
  const gridStyle = useMemo(() => ({ height: contentHeight, width: '100%' }), []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      resizable: true,
      sortable: true,
    };
  }, []);

  // const updateItems = useCallback((itemsToUpdate: any[]) => {
  //   const res = gridRef.current!.api.applyTransaction({
  //     update: itemsToUpdate,
  //   })!;
  // }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
    gridRef.current?.api.sizeColumnsToFit();
  }, []);

  // useEffect(() => {
  //   if (!tracks.length) return;
  //   updateItems([...tracks]);
  // }, [tracks]);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);

    setRowData(tracks);
  };

  const onDblClick = useCallback((event: RowDoubleClickedEvent) => {
    event.event?.preventDefault();
    const { data } = event;
    navigate(`detail/${data.id}`);
  }, []);

  const onShowCtxtMenu = useCallback((event: CellContextMenuEvent) => {
    event.event?.preventDefault();
    if (!event.node.isSelected()) {
      event.node.setSelected(true, true);
    }

    const selected = event.api.getSelectedRows() as Track[];
    console.log('selected', selected);
    showContextMenu(selected);
    // showCtxMenu(selected);
  }, []);

  return (
    <div
      style={gridStyle}
      className='ag-theme-alpine-auto-dark'
    >
      <AgGridReact
        ref={gridRef}
        rowSelection='multiple'
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        onFirstDataRendered={onFirstDataRendered}
        onRowDoubleClicked={e => onDblClick(e)}
        onCellContextMenu={e => onShowCtxtMenu(e)}
        suppressCellFocus
      />
    </div>
  );
};
