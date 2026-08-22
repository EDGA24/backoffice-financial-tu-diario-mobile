import React from 'react';
import { Box, Typography, ButtonBase, CircularProgress } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import TransactionListItem, {
    type TransactionKind,
} from '@/components/molecules/mobile/TransactionListItem/TransactionListItem';
import type { SvgIconComponent } from '@mui/icons-material';

export interface TransactionSummary {
    id: string;
    icon: SvgIconComponent;
    title: string;
    subtitle: string;
    amount: string;
    kind: TransactionKind;
    isPending?: boolean;
    // ISO date string, usada solo para agrupar por día (no se muestra tal cual)
    date?: string;
}

export interface TransactionSectionProps {
    transactions: TransactionSummary[];
    title?: string;
    actionLabel?: string;
    onActionClick?: () => void;
    hasMore?: boolean;
    loadingMore?: boolean;
    onLoadMore?: () => void;
    emptyMessage?: string;
}

const SIN_FECHA_KEY = 'sin-fecha';

interface DayGroup {
    key: string;
    label: string;
    items: TransactionSummary[];
}

// Agrupa manteniendo el orden en que llegan los items (se asume que el backend
// ya los regresa ordenados, más recientes primero).
const groupByDay = (transactions: TransactionSummary[]): DayGroup[] => {
    const order: string[] = [];
    const map = new Map<string, TransactionSummary[]>();

    transactions.forEach((t) => {
        const key = t.date ? t.date.slice(0, 10) : SIN_FECHA_KEY; // YYYY-MM-DD
        if (!map.has(key)) {
            map.set(key, []);
            order.push(key);
        }
        map.get(key)!.push(t);
    });

    return order.map((key) => {
        const label =
            key === SIN_FECHA_KEY
                ? 'Sin fecha'
                : new Date(key)
                      .toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
                      .toUpperCase();
        return { key, label, items: map.get(key)! };
    });
};

const TransactionSection: React.FC<TransactionSectionProps> = ({
    transactions,
    title = 'Movimientos',
    actionLabel = '',
    onActionClick,
    hasMore = false,
    loadingMore = false,
    onLoadMore,
    emptyMessage = 'No se encontraron movimientos',
}) => {
    const groups = groupByDay(transactions);

    return (
        <Box sx={{ mt: 4, px: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.2 }}>
                    {title}
                </Typography>
                <ButtonBase
                    onClick={onActionClick}
                    sx={{
                        px: 1.25,
                        py: 0.75,
                        borderRadius: 999,
                        '&:active': { backgroundColor: 'action.hover' },
                    }}
                >
                    <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: 'secondary.main' }}>
                        {actionLabel}
                    </Typography>
                </ButtonBase>
            </Box>

            <Box
                sx={{
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    px: 1.5,
                    boxShadow: '0px 4px 16px rgba(15, 23, 42, 0.06)',
                    overflow: 'hidden',
                }}
            >
                {transactions.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                            {emptyMessage}
                        </Typography>
                    </Box>
                )}

                {groups.map((group) => (
                    <Box key={group.key}>
                        <Typography
                            sx={{
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: 11,
                                letterSpacing: 0.8,
                                color: 'text.secondary',
                                pt: 2,
                                pb: 1,
                            }}
                        >
                            {group.label}
                        </Typography>

                        {group.items.map((t) => (
                            <TransactionListItem key={t.id} {...t} />
                        ))}
                    </Box>
                ))}

                {hasMore && transactions.length > 0 && (
                    <Box
                        sx={{
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'center',
                            py: 2,
                        }}
                    >
                        <ButtonBase
                            onClick={onLoadMore}
                            disabled={loadingMore}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 2.5,
                                py: 1,
                                borderRadius: 999,
                                backgroundColor: 'action.hover',
                                minHeight: 44,
                                '&:active': { backgroundColor: 'action.selected' },
                            }}
                        >
                            {loadingMore ? (
                                <CircularProgress size={16} sx={{ color: 'secondary.main' }} />
                            ) : (
                                <>
                                    <Typography
                                        sx={{ fontWeight: 700, fontSize: 13, color: 'secondary.main' }}
                                    >
                                        Mostrar más
                                    </Typography>
                                    <KeyboardArrowDownRoundedIcon
                                        sx={{ fontSize: 19, color: 'secondary.main' }}
                                    />
                                </>
                            )}
                        </ButtonBase>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default TransactionSection;