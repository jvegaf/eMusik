import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './TracksTable.css';
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
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import log from 'electron-log/renderer';
import { usePlayerAPI } from '@renderer/stores/usePlayerStore';
import { useNavigate } from 'react-router-dom';
import { TRACK_UPDATED } from '@preload/channels';

export const TracksTable = () => {
  // const { tracks, setTrackDetail, showCtxMenu, updatedTracks, setUpdatedTracks } = useAppState();
  const start = usePlayerAPI().start;
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

  const updateItem = useCallback((updatedItem: Track) => {
    const rowNode = gridRef.current!.api.getRowNode(updatedItem.id)!;
    rowNode.setData(updatedItem);
    log.info('[TracksTable] updated track: ', updatedItem.title);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onFirstDataRendered = useCallback((params: FirstDataRenderedEvent) => {
    gridRef.current?.api.sizeColumnsToFit();
  }, []);

  // useEffect(() => {
  //   if (!tracks.length) return;
  //   updateItems([...tracks]);
  // }, [tracks]);

  useEffect(() => {
    window.Main.on(TRACK_UPDATED, (updated: Track) => updateItem(updated));
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);

    setRowData(tracks);
  };

  const onDblClick = useCallback((event: RowDoubleClickedEvent) => {
    event.event?.preventDefault();
    const { data } = event;
    // navigate(`detail/${data.id}`);
    start(data.id);
  }, []);

  const onShowCtxtMenu = useCallback((event: CellContextMenuEvent) => {
    event.event?.preventDefault();
    if (!event.node.isSelected()) {
      event.node.setSelected(true, true);
    }

    const selected = event.api.getSelectedRows() as Track[];
    showContextMenu(selected);
    // showCtxMenu(selected);
  }, []);

  const onKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      gridRef.current?.api.deselectAll();
    }
  }, []);

  return (
    <div
      style={gridStyle}
      className='ag-theme-alpine-auto-dark ag-theme-symphony'
      onKeyDown={e => onKeyPress(e)}
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