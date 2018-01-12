package main

import (
	"log"
	"math"
	"strconv"
)

type InstantaneousDemand struct {
	DeviceMacId string
	MeterMacId  string
	// These are all numbers sent as hexadecmal 0xabcdef but Go's
	// xml decoder fails: err: strconv.ParseInt: parsing 0x...
	// so we make them strings.
	TimeStamp           string
	Demand              string
	Multiplier          string
	Divisor             string
	DigitsRight         string
	DigitsLeft          string
	SuppressLeadingZero string
}

func (i InstantaneousDemand) Watts() float64 {
	var demand, multiplier, divisor float64
	if x, err := strconv.ParseInt(i.Demand, 0, 32); err == nil {
		demand = float64(x)
	} else {
		log.Panicf("Unexpected demand value '%s': %s", i.Demand, err)
	}
	if x, err := strconv.ParseInt(i.Multiplier, 0, 32); err == nil {
		multiplier = float64(x)
	} else {
		log.Panicf("Unexpected multiplier value '%s': %s", i.Multiplier, err)
	}
	if x, err := strconv.ParseInt(i.Divisor, 0, 32); err == nil {
		divisor = float64(x)
	} else {
		log.Panicf("Unexpected divisor value '%s': %s", i.Divisor, err)
	}

	return ((demand * multiplier) / divisor) * 1000.0
}

type PriceCluster struct {
	DeviceMacId    string
	MeterMacId     string
	TimeStamp      string
	Price          string
	Currency       string
	TrailingDigits string
	Tier           string
	StartTime      string
	Duration       string
	RateLabel      string
}

func (p PriceCluster) Cost() float64 {
	price, _ := strconv.ParseInt(p.Price, 0, 64)
	digits, _ := strconv.ParseInt(p.TrailingDigits, 0, 64)
	return float64(price) / math.Pow(10, float64(digits))
}

type CurrentSummationDelivered struct {
	DeviceMacId         string
	MeterMacId          string
	TimeStamp           string
	SummationDelivered  string
	SummationReceived   string
	Multiplier          string
	Divisor             string
	DigitsRight         string
	DigitsLeft          string
	SuppressLeadingZero string
}

type TimeCluster struct {
	DeviceMacId string
	MeterMacId  string
	UTCTime     string
	LocalTime   string
}
