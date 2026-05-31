import React from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { AssistanceRequestPropToSort } from '../../../../services/assistanceRequestService';

interface TableCellHeaderProps {
  text: string;
  sortBy: AssistanceRequestPropToSort;
  selectedPropToSortTable: {
    [Property in AssistanceRequestPropToSort]?: boolean;
  };
  handleClickSortTable: (sortBy: AssistanceRequestPropToSort) => void;
}

/**
 * Component for sortable table headers
 * Renders a sortable table header cell with up/down arrows
 */
const TableCellHeader: React.FC<TableCellHeaderProps> = ({
  text,
  sortBy,
  selectedPropToSortTable,
  handleClickSortTable,
}) => {
  return (
    <div
      onClick={() => handleClickSortTable(sortBy)}
      style={{ userSelect: 'none', cursor: 'pointer' }}
    >
      {text}
      {selectedPropToSortTable[sortBy] !== undefined ? (
        selectedPropToSortTable[sortBy] ? (
          <ArrowDropUpIcon />
        ) : (
          <ArrowDropDownIcon />
        )
      ) : null}
    </div>
  );
};

export default TableCellHeader;