import * as React from 'react';
import { OrderPicker } from './OrderPicker';
import { OrderComposer } from './OrderComposer';

// Consider this as a combined OrderPicker + OrderComposer.
export const OrderSearch = ({ open, searchTerm, onSelect, ...props }: { open: any; searchTerm: string; onSelect: (result: any) => void;[key: string]: any }) => {
  const [composingItem, setComposingItem] = React.useState<any>(null);

  // If the flow is closed from outside, reset local state
  React.useEffect(() => {
    if (!open) setComposingItem(null);
  }, [open]);

  if (!open) return null;

  if (composingItem) {
    return (
      <OrderComposer
        open={true}
        medication={composingItem}
        onSelect={(result: any) => {
          if (result) {
            onSelect(result);
            setComposingItem(null);
          } else {
            // Cancelled from composer: close everything to match original behavior
            onSelect(null);
          }
        }}
        {...props}
      />
    );
  }

  return (
    <OrderPicker
      open={open}
      searchTerm={searchTerm}
      onSelect={(item: any) => {
        if (!item) {
          onSelect(null);
        } else if (Array.isArray(item)) {
          onSelect(item);
        } else {
          setComposingItem(item);
        }
      }}
      {...props}
    />
  );
};
