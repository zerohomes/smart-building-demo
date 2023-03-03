import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function IconCard({icon, title, content, unit}) {

  return (
    <Card sx={{ display: 'flex', minHeight: 100 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pl:2, pb:1 }}>
        {icon}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '0 0 auto' }}>
          <Typography variant="caption" color="text.secondary" component="div">
            {content}
          </Typography>
          <Typography component="div" variant="h5">
            {title}<Typography component="span" variant="overline" color="text.secondary">&nbsp;{unit}</Typography>
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}