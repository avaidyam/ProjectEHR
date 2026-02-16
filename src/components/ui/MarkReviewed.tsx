import * as React from 'react';
import { Button, Stack, Label, Icon } from './Core';

interface MarkReviewedProps {
    lastMarkedDate?: string | Date | null;
    username?: string | null;
    onChange?: (date: string, username: string) => void;
    sx?: any;
}

/**
 * MarkReviewed component provides a unified button to mark items as reviewed.
 * 
 * @param lastMarkedDate - The date when it was last marked.
 * @param username - The user who marked it.
 * @param onChange - Optional handler. If not provided, the component manages its own state for Demo purposes.
 */
export const MarkReviewed: React.FC<MarkReviewedProps> = ({
    lastMarkedDate: initialDate,
    username: initialUsername,
    onChange,
    sx
}) => {
    // We use internal state ONLY if onChange is not provided, as per instructions.
    const [internalDate, setInternalDate] = React.useState<string | null>(
        initialDate ? (typeof initialDate === 'string' ? initialDate : initialDate.toISOString()) : null
    );
    const [internalUsername, setInternalUsername] = React.useState<string | null>(initialUsername || null);

    // Determine what to display based on whether onChange is present
    const displayDate = onChange ? (initialDate ? (typeof initialDate === 'string' ? initialDate : initialDate.toISOString()) : null) : internalDate;
    const displayUsername = onChange ? initialUsername : internalUsername;

    const handlePress = () => {
        // @ts-ignore - Temporal is available globally in this project's environment
        const now = Temporal.Now.instant().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
        const currentUser = "Current User"; // Placeholder as requested "current user"

        if (onChange) {
            onChange(now, currentUser);
        } else {
            setInternalDate(now);
            setInternalUsername(currentUser);
        }
    };

    const isReviewed = !!displayDate;

    return (
        <Stack direction="row" alignItems="center" spacing={2} sx={sx}>
            <Button
                variant={isReviewed ? "contained" : "outlined"}
                color={isReviewed ? "success" : "primary"}
                size="small"
                startIcon={<Icon>{isReviewed ? 'check' : 'add'}</Icon>}
                onClick={handlePress}
            >
                {isReviewed ? 'Reviewed' : 'Mark as Reviewed'}
            </Button>
            {isReviewed ? (
                <Label variant="body2" color="success.main" italic>
                    Last Reviewed by {displayUsername} at {displayDate}
                </Label>
            ) : (
                <Label variant="body2" color="text.secondary" italic>
                    Not Reviewed
                </Label>
            )}
        </Stack>
    );
};
