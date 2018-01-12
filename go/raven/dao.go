package main

import (
	"log"
	"math"
	"strconv"
	"time"
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

var January2000Epoch time.Time

func init() {
	January2000Epoch = time.Date(2000, 1, 1, 0, 0, 0, 0, time.UTC)
}

func (i InstantaneousDemand) ToWatts() Watts {
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

	var t time.Time
	if x, err := strconv.ParseInt(i.TimeStamp, 0, 32); err != nil {
		log.Panicf("Unexpected TimeStamp value: %s - %s", i.TimeStamp, err)
	} else {
		t = January2000Epoch.Add(time.Duration(time.Duration(x) * time.Second))
	}

	return Watts{((demand * multiplier) / divisor) * 1000.0, t}
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

func (p PriceCluster) ToPrice() Price {
	price, _ := strconv.ParseInt(p.Price, 0, 64)
	digits, _ := strconv.ParseInt(p.TrailingDigits, 0, 64)

	var t time.Time
	if x, err := strconv.ParseInt(p.TimeStamp, 0, 32); err != nil {
		log.Panicf("Unexpected TimeStamp value: %s", p.TimeStamp)
	} else {
		t = January2000Epoch.Add(time.Duration(time.Duration(x) * time.Second))
	}

	return Price{float64(price) / math.Pow(10, float64(digits)), t}
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

type ConnectionStatus struct {
	DeviceMacId  string
	MeterMacId   string
	Status       string
	Description  string
	StatusCode   string
	ExtPanId     string
	Channel      string
	ShortAddr    string
	LinkStrength string
}
