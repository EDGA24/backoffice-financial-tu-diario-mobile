import React from 'react';
import { Box, Typography, ButtonBase } from '@mui/material';
import TransactionListItem, {
    type TransactionKind,
} from '@/components/molecules/mobile/TransactionListItem/TransactionListItem';
import type { SvgIconComponent } from '@mui/icons-material';

export interface TransactionSummary {
    id: number;
    icon: SvgIconComponent;
    title: string;
    subtitle: string;
    amount: string;
    kind: TransactionKind;
}

export interface TransactionSectionProps {
    transactions: TransactionSummary[];
    title?: string;
    actionLabel?: string;
    onActionClick?: () => void;
}

const TransactionSection: React.FC<TransactionSectionProps> = ({
    transactions,
    title = 'Movimientos',
    actionLabel = 'Consultar todos',
    onActionClick,
}) => {
    return (
        <Box sx={{ mt: 3, px: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{title}</Typography>
                <ButtonBase onClick={onActionClick}>
                    <Typography sx={{ fontWeight: 700, fontSize: 12, color: 'secondary.main' }}>
                        {actionLabel}
                    </Typography>
                </ButtonBase>
            </Box>

            <Box
                sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    px: 1,
                }}
            >
                {transactions.map((t) => (
                    <TransactionListItem key={t.id} {...t} />
                ))}
            </Box>
        </Box>
    );
};

export default TransactionSection;