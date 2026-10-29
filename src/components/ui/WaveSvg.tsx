import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

const C = {
    yellow: '#FFC42E',
    sun: '#FFD97A',
    road: 'rgba(170, 120, 10, 0.22)',
    dash: 'rgba(255, 255, 255, 0.75)',
    navy: '#14213D',
    bg: '#F5F3EE',
    muted: '#6B7280',
    border: '#E5E1D8',
    white: '#FFFFFF',
};

const WaveSvg = () => {
    return (

        <View style={styles.roadContainer}>
            <Svg width="100%" height={100} viewBox="0 0 300 100" preserveAspectRatio="none">
                {/* Road background */}
                <Path
                    d="M -10 55 C 65 0, 105 100, 180 70 S 290 0, 370 55"
                    stroke={C.road}
                    strokeWidth={44}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Road center dashed line */}
                <Path
                    d="M -10 55 C 65 0, 105 100, 180 70 S 290 0, 370 55"
                    stroke={colors.white}
                    strokeWidth={2.5}
                    strokeDasharray="14 9"
                    fill="none"
                />
            </Svg>
        </View>
    )
}

export default WaveSvg

const styles = StyleSheet.create({
    roadContainer: {
        height: 100,
        marginTop: 20,
        overflow: 'hidden',
        transform: [{ rotate: '-5deg' }],

    },
})